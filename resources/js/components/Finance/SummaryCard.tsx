import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  className,
}: SummaryCardProps) {
  const getTrendColor = () => {
    if (!trend) return '';
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-muted-foreground';
  };

  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
            <TrendIcon className="h-3 w-3" />
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
