import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Zap, Shield, Rocket } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="container max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 p-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-4">
              FocusFlow
              <span className="text-primary block mt-2">Master Your Goals.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              The intelligent task tracker that combines Kanban workflows, goal tracking, and AI coaching to help you achieve more.
            </p>
          </div>

          <div className="space-y-4">
            <Feature icon={CheckCircle2} title="Smart Goal Tracking" desc="Set daily and weekly goals that align with your vision." />
            <Feature icon={Zap} title="AI Productivity Coach" desc="Get real-time advice on breaking down complex tasks." />
            <Feature icon={Rocket} title="Sprints & Retrospectives" desc="Run your life like an agile product team." />
          </div>
        </div>

        <Card className="max-w-md w-full mx-auto shadow-2xl border-primary/20 backdrop-blur-sm bg-card/80">
          <CardHeader className="text-center space-y-2 pb-8 pt-8">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your workspace</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Button 
              size="lg" 
              className="w-full text-lg h-12 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" 
              onClick={handleLogin}
            >
              Log In with Replit
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-6">
              Secure authentication powered by Replit Auth.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
