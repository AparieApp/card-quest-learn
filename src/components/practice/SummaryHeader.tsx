
import React from "react";

interface SummaryHeaderProps {
  title: string;
  subtitle: string;
  isReviewMode?: boolean;
  isTestMode: boolean;
}

const SummaryHeader: React.FC<SummaryHeaderProps> = ({
  title,
  subtitle,
  isReviewMode = false,
  isTestMode,
}) => (
  <div className="text-center">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="text-muted-foreground">
      {subtitle || (isReviewMode ? "Review" : isTestMode ? "Test" : "Practice") + " results"}
    </p>
  </div>
);

export default SummaryHeader;
