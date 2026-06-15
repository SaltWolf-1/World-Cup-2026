import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import Matches from "@/pages/matches";
import MatchDetail from "@/pages/match-detail";
import Teams from "@/pages/teams";
import TeamDetail from "@/pages/team-detail";
import Standings from "@/pages/standings";
import Predictions from "@/pages/predictions";
import Highlights from "@/pages/highlights";
import Knockout from "@/pages/knockout";
import Sweepstake from "@/pages/sweepstake";
import SweepstakeView from "@/pages/sweepstake-view";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/matches" component={Matches} />
        <Route path="/matches/:id" component={MatchDetail} />
        <Route path="/teams" component={Teams} />
        <Route path="/teams/:id" component={TeamDetail} />
        <Route path="/standings" component={Standings} />
        <Route path="/knockout" component={Knockout} />
        <Route path="/sweepstake" component={Sweepstake} />
        <Route path="/s/:gameId" component={SweepstakeView} />
        <Route path="/predictions" component={Predictions} />
        <Route path="/highlights" component={Highlights} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
