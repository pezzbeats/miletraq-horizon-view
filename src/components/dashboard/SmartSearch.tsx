import { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Command, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SearchSuggestion {
  id: string;
  type: 'query' | 'filter' | 'navigation' | 'recent';
  label: string;
  description?: string;
  icon?: any;
  action?: () => void;
  href?: string;
  category?: string;
}

interface SmartSearchProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: any) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  className?: string;
}

export const SmartSearch = ({
  onSearch,
  onFilterChange,
  placeholder = "Search vehicles, drivers, fuel logs... or ask anything",
  suggestions = [],
  recentSearches = [],
  className
}: SmartSearchProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Smart suggestions based on common queries
  const defaultSuggestions: SearchSuggestion[] = [
    {
      id: 'vehicles-high-fuel',
      type: 'query',
      label: 'Vehicles with high fuel costs',
      description: 'Show vehicles exceeding budget',
      icon: TrendingUp,
      category: 'Analytics'
    },
    {
      id: 'maintenance-due',
      type: 'query', 
      label: 'Vehicles due for maintenance',
      description: 'Based on mileage and time',
      icon: Clock,
      category: 'Maintenance'
    },
    {
      id: 'fuel-efficiency',
      type: 'query',
      label: 'Fuel efficiency last month',
      description: 'Compare with previous period',
      icon: Sparkles,
      category: 'Reports'
    },
    {
      id: 'add-fuel-log',
      type: 'navigation',
      label: 'Add fuel log',
      description: 'Record new fuel entry',
      href: '/fuel-log',
      category: 'Quick Actions'
    },
    {
      id: 'view-analytics',
      type: 'navigation', 
      label: 'View analytics dashboard',
      description: 'Detailed performance insights',
      href: '/analytics',
      category: 'Navigation'
    }
  ];

  const allSuggestions = [...defaultSuggestions, ...suggestions];

  // Filter suggestions based on query
  const filteredSuggestions = query.length > 0 
    ? allSuggestions.filter(s => 
        s.label.toLowerCase().includes(query.toLowerCase()) ||
        s.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allSuggestions.slice(0, 6);

  // Group suggestions by category
  const groupedSuggestions = filteredSuggestions.reduce((acc, suggestion) => {
    const category = suggestion.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(suggestion);
    return acc;
  }, {} as Record<string, SearchSuggestion[]>);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.action) {
      suggestion.action();
    } else if (suggestion.href) {
      navigate(suggestion.href);
    } else if (suggestion.type === 'query') {
      setQuery(suggestion.label);
      if (onSearch) {
        onSearch(suggestion.label);
      }
    }
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalSuggestions = filteredSuggestions.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalSuggestions - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : totalSuggestions - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        } else if (query.trim()) {
          if (onSearch) {
            onSearch(query);
          }
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.closest('.search-container')?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative search-container', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-20 h-12 text-base bg-background/50 backdrop-blur-sm border-2 transition-all duration-200 focus:border-primary focus:bg-background"
        />
        
        {/* Action buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Command indicator */}
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
          <kbd className="pointer-events-none hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
            <Command className="h-3 w-3" />
            K
          </kbd>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-hidden shadow-xl border-2 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-0">
            {filteredSuggestions.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {Object.entries(groupedSuggestions).map(([category, suggestions]) => (
                  <div key={category}>
                    {/* Category header */}
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 border-b">
                      {category}
                    </div>
                    
                    {/* Suggestions in category */}
                    {suggestions.map((suggestion, index) => {
                      const globalIndex = filteredSuggestions.indexOf(suggestion);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <div
                          key={suggestion.id}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-b-0',
                            isSelected 
                              ? 'bg-primary/10 border-primary/20' 
                              : 'hover:bg-muted/50'
                          )}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {/* Icon */}
                          {suggestion.icon && (
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <suggestion.icon className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {suggestion.label}
                            </div>
                            {suggestion.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {suggestion.description}
                              </div>
                            )}
                          </div>
                          
                          {/* Type badge */}
                          <Badge 
                            variant="outline" 
                            className="text-xs shrink-0"
                          >
                            {suggestion.type}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No suggestions found</p>
                <p className="text-xs opacity-75">Try different keywords</p>
              </div>
            )}

            {/* Recent searches */}
            {recentSearches.length > 0 && query.length === 0 && (
              <div className="border-t border-border/50">
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                  Recent Searches
                </div>
                {recentSearches.slice(0, 3).map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-muted/50 text-sm"
                    onClick={() => handleInputChange(search)}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {search}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};