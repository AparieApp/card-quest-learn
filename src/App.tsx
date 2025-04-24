
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/auth/AuthProvider";
import { DeckProvider } from "@/context/DeckContext";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DeckEdit from "./pages/DeckEdit";
import Practice from "./pages/Practice";
import Test from "./pages/Test";
import DeckShare from "./pages/DeckShare";
import SharedDeck from "./pages/SharedDeck";
import SharedDeckPractice from "./pages/SharedDeckPractice";
import SharedDeckTest from "./pages/SharedDeckTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <DeckProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/deck/:id" element={<DeckEdit />} />
              <Route path="/deck/:id/practice" element={<Practice />} />
              <Route path="/deck/:id/test" element={<Test />} />
              <Route path="/deck/:id/share" element={<DeckShare />} />
              <Route path="/shared/:code" element={<SharedDeck />} />
              <Route path="/shared/:code/practice" element={<SharedDeckPractice />} />
              <Route path="/shared/:code/test" element={<SharedDeckTest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </DeckProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
