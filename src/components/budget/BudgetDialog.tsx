import { useState, useEffect } from "react";
import { format, addMonths, addQuarters, addYears } from "date-fns";
import { CalendarIcon, Calculator, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { BudgetRecord } from "@/pages/Budget";

const budgetFormSchema = z.object({
  category: z.enum(["fuel", "maintenance", "parts"], {
    required_error: "Category is required",
  }),
  time_period: z.enum(["monthly", "quarterly", "yearly"], {
    required_error: "Time period is required",
  }),
  period_start: z.date({
    required_error: "Period start date is required",
  }),
  period_end: z.date({
    required_error: "Period end date is required",
  }),
  budgeted_amount: z.number().min(1000, "Budget amount must be at least ₹1,000"),
  description: z.string().optional(),
}).refine((data) => data.period_end > data.period_start, {
  message: "End date must be after start date",
  path: ["period_end"],
});

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: BudgetRecord | null;
  onSuccess: () => void;
}

export const BudgetDialog = ({
  open,
  onOpenChange,
  budget,
  onSuccess,
}: BudgetDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [predictedSpending, setPredictedSpending] = useState<number | null>(null);

  const form = useForm<z.infer<typeof budgetFormSchema>>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: "fuel",
      time_period: "monthly",
      budgeted_amount: 50000,
    },
  });

  const watchedCategory = form.watch("category");
  const watchedTimePeriod = form.watch("time_period");
  const watchedStartDate = form.watch("period_start");

  // Auto-calculate end date based on time period
  useEffect(() => {
    if (watchedStartDate && watchedTimePeriod) {
      let endDate: Date;
      switch (watchedTimePeriod) {
        case 'monthly':
          endDate = addMonths(watchedStartDate, 1);
          break;
        case 'quarterly':
          endDate = addQuarters(watchedStartDate, 1);
          break;
        case 'yearly':
          endDate = addYears(watchedStartDate, 1);
          break;
        default:
          endDate = addMonths(watchedStartDate, 1);
      }
      // Subtract one day to make it the last day of the period
      endDate.setDate(endDate.getDate() - 1);
      form.setValue("period_end", endDate);
    }
  }, [watchedStartDate, watchedTimePeriod, form]);

  // Predict spending based on historical data
  useEffect(() => {
    const predictSpending = async () => {
      if (!watchedCategory || !watchedStartDate || !watchedTimePeriod) return;

      try {
        // Get historical data for the category
        const endDate = new Date(watchedStartDate);
        switch (watchedTimePeriod) {
          case 'monthly':
            endDate.setMonth(endDate.getMonth() + 1);
            break;
          case 'quarterly':
            endDate.setMonth(endDate.getMonth() + 3);
            break;
          case 'yearly':
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
        }

        // Query historical spending
        const { data: historicalData } = await supabase
          .rpc('calculate_actual_spending', {
            p_category: watchedCategory,
            p_start_date: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Last 90 days
            p_end_date: format(new Date(), 'yyyy-MM-dd')
          });

        if (historicalData) {
          // Extrapolate based on time period
          let multiplier = 1;
          switch (watchedTimePeriod) {
            case 'monthly':
              multiplier = 30 / 90; // Scale 90 days to 30 days
              break;
            case 'quarterly':
              multiplier = 90 / 90; // Already 90 days
              break;
            case 'yearly':
              multiplier = 365 / 90; // Scale 90 days to 365 days
              break;
          }
          setPredictedSpending(historicalData * multiplier);
        }
      } catch (error) {
        console.error('Error predicting spending:', error);
      }
    };

    predictSpending();
  }, [watchedCategory, watchedStartDate, watchedTimePeriod]);

  // Reset form when dialog opens/closes or budget changes
  useEffect(() => {
    if (open) {
      if (budget) {
        // Editing existing budget
        form.reset({
          category: budget.category as any,
          time_period: budget.time_period as any,
          period_start: new Date(budget.period_start),
          period_end: new Date(budget.period_end),
          budgeted_amount: budget.budgeted_amount,
          description: budget.description || "",
        });
      } else {
        // Adding new budget
        const today = new Date();
        const nextMonth = addMonths(today, 1);
        nextMonth.setDate(nextMonth.getDate() - 1);
        
        form.reset({
          category: "fuel",
          time_period: "monthly",
          period_start: today,
          period_end: nextMonth,
          budgeted_amount: 50000,
          description: "",
        });
      }
    }
  }, [open, budget, form]);

  const onSubmit = async (values: z.infer<typeof budgetFormSchema>) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to manage budgets",
          variant: "destructive",
        });
        return;
      }

      const budgetData = {
        category: values.category,
        time_period: values.time_period,
        period_start: format(values.period_start, 'yyyy-MM-dd'),
        period_end: format(values.period_end, 'yyyy-MM-dd'),
        budgeted_amount: values.budgeted_amount,
        description: values.description || null,
        created_by: user.id,
        status: 'active',
      };

      if (budget) {
        // Update existing budget
        const { error } = await supabase
          .from('budget')
          .update(budgetData as any)
          .eq('id', budget.id);
        
        if (error) throw error;
      } else {
        // Create new budget
        const { error } = await supabase
          .from('budget')
          .insert([budgetData as any]);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: budget 
          ? "Budget updated successfully" 
          : "Budget created successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast({
        title: "Error",
        description: "Failed to save budget",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const categories = [
    { value: "fuel", label: "Fuel Management" },
    { value: "maintenance", label: "Vehicle Maintenance" },
    { value: "parts", label: "Parts & Components" },
  ];

  const timePeriods = [
    { value: "monthly", label: "Monthly Budget" },
    { value: "quarterly", label: "Quarterly Budget" },
    { value: "yearly", label: "Yearly Budget" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto modal-content">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none" />
        <DialogHeader className="relative z-10 pb-6 border-b border-border/50">
          <DialogTitle className="text-2xl font-bold gradient-header-text">
            {budget ? "Edit Budget" : "Create New Budget"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            {budget ? "Update budget allocation and planning details" : "Set up financial planning and tracking for your fleet operations"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            {/* Category and Time Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Period *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timePeriods.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Period Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="period_start"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Period Start Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick start date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period_end"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Period End Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget Amount */}
            <FormField
              control={form.control}
              name="budgeted_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocated Budget Amount (₹) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="1000"
                        min="1000"
                        placeholder="Enter budget amount (minimum ₹1,000)"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="pl-8"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Spending Prediction */}
            {predictedSpending && (
              <Card className="glass-card border-blue-200/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Spending Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Predicted Spending:</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(predictedSpending)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Your Budget:</span>
                      <span className="font-semibold">
                        {formatCurrency(form.watch("budgeted_amount") || 0)}
                      </span>
                    </div>
                    {form.watch("budgeted_amount") && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Variance:</span>
                          <span className={`font-bold ${
                            predictedSpending > form.watch("budgeted_amount") 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {predictedSpending > form.watch("budgeted_amount") 
                              ? `+${formatCurrency(predictedSpending - form.watch("budgeted_amount"))}` 
                              : `-${formatCurrency(form.watch("budgeted_amount") - predictedSpending)}`}
                          </span>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Based on last 90 days of {watchedCategory} spending
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about this budget allocation..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="btn-gradient">
                {loading ? "Saving..." : budget ? "Update Budget" : "Create Budget"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};