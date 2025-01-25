"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatBox } from "@/components/chat-box";

export function ChatInterface() {
  const [apiToken, setApiToken] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically validate the token with your backend
    // For this example, we'll consider any non-empty string as valid
    if (apiToken.trim() !== "") {
      setIsTokenValid(true);
    }
  };

  if (isTokenValid) {
    return <ChatBox />;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Enter API Token</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTokenSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your API token"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
