import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./planner-modern.css";

// Standalone pages
import AdminCodigos from "./pages/AdminCodigos";
import PlannerNoivas from "./pages/PlannerNoivas";
import ActivationGate from "./components/ActivationGate";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PlannerNoivas} />
      <Route path="/painel-codigos" component={AdminCodigos} />
      <Route path="/admin-codigos" component={AdminCodigos} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <ActivationGate>
            <Router />
          </ActivationGate>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
