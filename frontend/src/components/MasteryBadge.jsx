import { Award, X } from 'lucide-react';

function MasteryBadge({ label, topic, awardedAt, onRemove }) {
  // TODO: add a custom icon on the right side to make the badges unique looking
  return <span className="inline-flex items-center gap-2 rounded-full border-violet-200 border-2 bg-violet-50 px-3 py-1 text-sm font-semibold dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200 dark:ring-violet-800 ring-1 text-violet-800 ring-violet-300 ring hover:dark:text-yellow-100 hover:text-violet-500">
    <Award className="h-5 w-5" />
    {label}
    {":"}
    {awardedAt && 
    <span className="text-xs">
      {new Date(awardedAt).toLocaleDateString()}
    </span>}
    {onRemove && (
      <button
        onClick={onRemove}
        aria-label="Remove badge"
        className="text-violet-400 hover:text-violet-700 dark:hover:text-violet-200"
      >
        <X className="h-3 w-3" />
      </button>
    )}
    </span>}

  

export default MasteryBadge;

//TODO FUTURE ME: make these actual badges, using a vector art gallery given to the teacher. Can make them yourself or work with a open gallery. Or commission an artist. Sky's the limit. 