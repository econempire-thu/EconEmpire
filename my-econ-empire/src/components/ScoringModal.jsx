import { X } from "lucide-react";

export default function ScoringModal({
  showModal,
  setShowModal,
  happyText,
  contentText,
  sadText,
  angryText,
}) {
  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-stone-800 text-stone-300 rounded-lg p-6 w-full max-w-2xl shadow-xl border border-stone-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">How Scoring Works</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-200 text-xl cursor-pointer"
              >
                <X />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-stone-600 text-sm">
                <thead>
                  <tr className="bg-stone-700 text-stone-300">
                    <th className="border border-stone-600 px-3 py-2">
                      Status
                    </th>
                    <th className="border border-stone-600 px-3 py-2">
                      Condition
                    </th>
                    <th className="border border-stone-600 px-3 py-2">
                      Victory Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-stone-700/50">
                    <td className="border border-stone-600 px-3 py-2 text-green-300 font-medium">
                      Happy
                    </td>
                    <td className="border border-stone-600 px-3 py-2">
                      {happyText}
                    </td>
                    <td className="border border-stone-600 px-3 py-2">+1</td>
                  </tr>
                  <tr className="bg-stone-700/30">
                    <td className="border border-stone-600 px-3 py-2 text-yellow-300 font-medium">
                      Content
                    </td>
                    <td className="border border-stone-600 px-3 py-2">
                      {contentText}
                    </td>
                    <td className="border border-stone-600 px-3 py-2">+0.5</td>
                  </tr>
                  <tr className="bg-stone-700/50">
                    <td className="border border-stone-600 px-3 py-2 text-blue-300 font-medium">
                      Sad
                    </td>
                    <td className="border border-stone-600 px-3 py-2">
                      {sadText}
                    </td>
                    <td className="border border-stone-600 px-3 py-2">0</td>
                  </tr>
                  <tr className="bg-stone-700/30">
                    <td className="border border-stone-600 px-3 py-2 text-red-300 font-medium">
                      Angry
                    </td>
                    <td className="border border-stone-600 px-3 py-2">
                      {angryText}
                    </td>
                    <td className="border border-stone-600 px-3 py-2">-1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
