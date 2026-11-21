import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden border-border/50 bg-card/50">
      <CardHeader className="p-0 relative">
        <Skeleton className="w-full aspect-[2/3] rounded-none" />
      </CardHeader>
      <CardContent className="p-4 flex flex-col flex-1 gap-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center mt-auto pt-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
