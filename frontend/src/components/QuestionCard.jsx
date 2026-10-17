import React from 'react';
import { Bookmark, CheckCircle2, XCircle, HelpCircle, Award } from 'lucide-react';

export default function QuestionCard({
  index,
  totalCount,
  questionObj,
  selectedOption,
  onSelectOption,
  showFeedback = false,
  isBookmarked = false,
  onToggleBookmark,
  mode = 'practice'
}) {
  if (!questionObj) return null;
  const isUrdu = questionObj.language === 'ur' || /[\u0600-\u06FF]/.test(questionObj.question);

  return (
    <article
      dir={isUrdu ? 'rtl' : 'ltr'}
      className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-sm transition-all animate-fadeIn"
    >
      {/* Compact Question Metadata Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-100" dir="ltr">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="px-2 py-0.5 text-[11px] font-black rounded-lg bg-slate-900 text-white shadow-xs">
            Q {index + 1}{totalCount ? ` / ${totalCount}` : ''}
          </span>
          {questionObj.difficulty && (
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md capitalize ${
              questionObj.difficulty === 'hard'
                ? 'bg-red-50 text-red-700 border border-red-200/60'
                : questionObj.difficulty === 'medium'
                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
            }`}>
              {questionObj.difficulty}
            </span>
          )}
          {questionObj.chapter && (
            <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded-md bg-slate-100 hidden xs:inline-block truncate max-w-[150px]">
              {questionObj.chapter}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {mode === 'exam' && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-600" />
              <span>1 Mark</span>
            </span>
          )}
          {onToggleBookmark && (
            <button
              type="button"
              onClick={() => onToggleBookmark(questionObj._id)}
              className="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition"
              title="Bookmark Question"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Question Prompt */}
      <h3 className={`text-sm sm:text-base font-bold text-slate-900 mb-2.5 ${
        isUrdu ? 'font-urdu leading-[2.1] text-right text-base sm:text-lg' : 'leading-snug'
      }`}>
        {questionObj.question}
      </h3>

      {/* 4 Compact Options */}
      <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
        {questionObj.options?.map((optionText, optIdx) => {
          const isSelected = selectedOption === optIdx;
          const isCorrect = questionObj.correctAnswer === optIdx;

          let optionStyle = 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/90 hover:border-slate-300 text-slate-800';
          let badgeStyle = 'bg-white text-slate-600 border border-slate-300';

          if (showFeedback) {
            if (isCorrect) {
              optionStyle = 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-semibold ring-1 ring-emerald-500/30';
              badgeStyle = 'bg-emerald-600 text-white font-black shadow-xs border-emerald-600';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'border-red-400 bg-red-50/90 text-red-950 font-semibold ring-1 ring-red-400/30';
              badgeStyle = 'bg-red-500 text-white font-black shadow-xs border-red-500';
            }
          } else if (isSelected) {
            optionStyle = 'border-amber-500 bg-amber-50/70 text-slate-950 font-semibold ring-2 ring-amber-400/30 shadow-xs';
            badgeStyle = 'bg-amber-500 text-slate-950 font-black shadow-xs border-amber-500';
          }

          return (
            <button
              key={optIdx}
              type="button"
              disabled={showFeedback}
              onClick={() => onSelectOption(optIdx)}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 sm:py-2.5 rounded-xl border text-left transition-all active:scale-[0.99] cursor-pointer ${optionStyle} ${
                isUrdu ? 'flex-row-reverse text-right font-urdu leading-relaxed' : ''
              }`}
            >
              <div className={`flex items-center gap-2.5 flex-1 min-w-0 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-black shrink-0 transition ${badgeStyle}`}>
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="text-xs sm:text-sm font-medium leading-snug break-words">
                  {typeof optionText === 'object' && optionText !== null
                    ? (optionText.text || optionText.option || optionText.label || JSON.stringify(optionText))
                    : optionText}
                </span>
              </div>

              {/* Status / Radio indicator */}
              <div className="shrink-0 flex items-center">
                {showFeedback ? (
                  <>
                    {isCorrect && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />}
                    {isSelected && !isCorrect && <XCircle className="w-4.5 h-4.5 text-red-600 shrink-0" />}
                  </>
                ) : (
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                    isSelected ? 'border-amber-500 bg-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {showFeedback && questionObj.explanation && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs text-slate-700 animate-fadeIn">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1" dir="ltr">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Explanation</span>
          </div>
          <p className={isUrdu ? 'font-urdu leading-relaxed text-right' : 'leading-relaxed'}>
            {questionObj.explanation}
          </p>
        </div>
      )}
    </article>
  );
}
