import React from 'react';
import { Bookmark, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export default function QuestionCard({
  index,
  questionObj,
  selectedOption,
  onSelectOption,
  showFeedback = false,
  isBookmarked = false,
  onToggleBookmark
}) {
  const isUrdu = questionObj.language === 'ur' || /[\u0600-\u06FF]/.test(questionObj.question);

  return (
    <article
      dir={isUrdu ? 'rtl' : 'ltr'}
      className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm transition-all"
    >
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100" dir="ltr">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-brand-navy/10 text-brand-navy">
            Q #{index + 1}
          </span>
          {questionObj.difficulty && (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize ${
              questionObj.difficulty === 'hard'
                ? 'bg-red-50 text-red-700'
                : questionObj.difficulty === 'medium'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}>
              {questionObj.difficulty}
            </span>
          )}
          {questionObj.chapter && (
            <span className="text-xs text-slate-500 font-medium">{questionObj.chapter}</span>
          )}
        </div>

        {onToggleBookmark && (
          <button
            type="button"
            onClick={() => onToggleBookmark(questionObj._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-gold"
            title="Bookmark Question"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-brand-gold text-brand-gold' : ''}`} />
          </button>
        )}
      </div>

      <h3 className={`text-lg font-semibold text-slate-900 mb-5 ${
        isUrdu ? 'font-urdu leading-[2.3] text-right text-xl' : 'leading-relaxed'
      }`}>
        {questionObj.question}
      </h3>

      <div className="space-y-3">
        {questionObj.options.map((optionText, optIdx) => {
          const isSelected = selectedOption === optIdx;
          const isCorrect = questionObj.correctAnswer === optIdx;

          let optionStyle = 'border-slate-200 hover:border-brand-navy/60 bg-slate-50/70';
          if (showFeedback) {
            if (isCorrect) {
              optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'border-red-500 bg-red-50 text-red-900';
            }
          } else if (isSelected) {
            optionStyle = 'border-brand-navy bg-brand-navy/5 ring-2 ring-brand-navy/20';
          }

          return (
            <button
              key={optIdx}
              type="button"
              disabled={showFeedback}
              onClick={() => onSelectOption(optIdx)}
              className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border text-left transition-all ${optionStyle} ${
                isUrdu ? 'flex-row-reverse text-right font-urdu leading-loose' : ''
              }`}
            >
              <div className={`flex items-center gap-3 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold shrink-0 ${
                  isSelected ? 'bg-brand-navy text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}>
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="text-sm sm:text-base font-medium text-slate-800">
                  {optionText}
                </span>
              </div>

              {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
            </button>
          );
        })}
      </div>

      {showFeedback && questionObj.explanation && (
        <div className="mt-5 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-sm text-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1" dir="ltr">
            <HelpCircle className="w-4 h-4" />
            <span>Explanation</span>
          </div>
          <p className={isUrdu ? 'font-urdu leading-loose text-right' : ''}>
            {questionObj.explanation}
          </p>
        </div>
      )}
    </article>
  );
}
