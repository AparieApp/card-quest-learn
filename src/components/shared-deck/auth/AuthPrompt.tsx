
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AuthPrompt = () => {
  const navigate = useNavigate();
  
  return (
    <div className="pt-2 text-center">
      <p className="text-sm text-muted-foreground mb-2">
        Want to save this deck for later?
      </p>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => navigate('/auth')}
      >
        Log in or Sign up
      </Button>
    </div>
  );
};
