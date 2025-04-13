import React from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TokenDetailPage from "@/pages/TokenDetailPage";
import { TokenProvider } from "./context/TokenContext";

function App() {
  return (
    <TokenProvider>
      <div className="app">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/token/:address" component={TokenDetailPage} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </div>
    </TokenProvider>
  );
}

export default App;
