import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { Navbar } from "./components/Navbar";
import NotFound from "./pages/NotFound";
import TripsPage from "./pages/Trips";
import TripDetailPage from "./pages/TripDetail";
import ItemsPage from "./pages/Items";
import BagsPage from "./pages/Bags";
import LearnMorePage from "./pages/LearnMore";
import PackingPage from "./pages/Packing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/:tripId" element={<TripDetailPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/bags" element={<BagsPage />} />
          <Route path="/learn-more" element={<LearnMorePage />} />
          <Route path="/trips/:tripId/packing" element={<PackingPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;