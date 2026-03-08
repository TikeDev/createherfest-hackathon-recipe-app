import { useNavigate } from "react-router-dom";
import { RecipeInput } from "@/components/extraction/RecipeInput";
import { ExtractionProgressDisplay } from "@/components/extraction/ExtractionProgress";
import { useRecipeExtraction } from "@/hooks/useRecipeExtraction";
import { Icon } from "@/components/ui/icon";
import { CircleCheck } from "lucide-react";

export default function Extract() {
  const navigate = useNavigate();
  const { status, progress, result, error, run, reset } = useRecipeExtraction();

  // Navigate to recipe detail once extraction is done
  if (status === "done" && result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        <Icon
          icon={CircleCheck}
          size="xl"
          label="Recipe saved successfully"
          className="text-sage"
        />
        <h1 className="text-xl font-headline text-forest">{result.title}</h1>
        <p className="text-sm text-forest/60">Nice work. That recipe is saved.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              void navigate(`/recipe/${result.id}`);
            }}
            className="rounded-lg bg-sage px-5 py-2.5 text-sm font-semibold text-white hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2"
          >
            View Recipe
          </button>
          <button
            onClick={reset}
            className="rounded-lg border border-mist-pale px-5 py-2.5 text-sm font-semibold text-forest hover:border-mist focus:outline-none focus:ring-2 focus:ring-mist focus:ring-offset-2"
          >
            Add Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-8 space-y-6 md:py-8">
      <div>
        <h1 className="pl-14 text-left text-2xl font-headline text-forest md:pl-0">
          Add a Recipe
        </h1>
        <p className="mt-1 pl-14 text-left text-sm text-forest/60 md:pl-0">
          Import from a URL or paste recipe text. The AI will extract and structure it for you.
        </p>
      </div>

      <RecipeInput status={status} onSubmit={run} />

      <ExtractionProgressDisplay status={status} progress={progress} error={error} />
    </div>
  );
}
