
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import International from "./pages/International";
import Crypto from "./pages/Crypto";
import Patterns from "./pages/Patterns";
import Technical from "./pages/Technical";
import Fundamental from "./pages/Fundamental";
import Predictions from "./pages/Predictions";
import Models from "./pages/Models";
import Search from "./pages/Search";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Get the basename from environment or use '/market-vision-ai-detect' for GitHub Pages
const basename = process.env.NODE_ENV === 'production' ? '/market-vision-ai-detect' : '';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/international" element={<International />} />
          <Route path="/crypto" element={<Crypto />} />
          <Route path="/patterns" element={<Patterns />} />
          <Route path="/technical" element={<Technical />} />
          <Route path="/fundamental" element={<Fundamental />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/models" element={<Models />} />
          <Route path="/search" element={<Search />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
