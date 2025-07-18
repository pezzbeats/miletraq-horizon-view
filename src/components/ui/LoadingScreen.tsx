export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center mb-4 mx-auto">
          <span className="text-white font-bold text-lg">MT</span>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading MileTraq...</p>
      </div>
    </div>
  );
}