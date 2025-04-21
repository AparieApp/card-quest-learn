
import React from "react";

interface SummaryHeaderProps {
  isReviewMode?: boolean;
  isTestMode: boolean;
}

const SummaryHeader: React.FC<SummaryHeaderProps> = ({
  isReviewMode = false,
  isTestMode,
}) => (
  <div className="text-center">
    <h1 className="text-3xl font-bold">Summary</h1>
    <p className="text-muted-foreground">
      Your {isReviewMode ? "review" : isTestMode ? "test" : "practice"} results
    </p>
  </div>
);

export default SummaryHeader;
