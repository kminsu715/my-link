import { dummyLinks } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center py-16 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md flex flex-col gap-4">
        {dummyLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full transition-transform duration-200 hover:scale-[1.02] focus:scale-[1.02] focus:outline-none"
          >
            <Card className="w-full overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-center min-h-[64px]">
                <h2 className="text-base font-medium text-slate-800 dark:text-slate-100">
                  {link.title}
                </h2>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
