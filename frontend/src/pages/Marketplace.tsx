import { useState } from "react";
import { useOpportunities } from "../hooks/useOpportunities";

const LISTING_TYPES = ["TUTORING", "STUDY_GROUP", "PROJECT_MENTORSHIP"] as const;
const MODES = ["ONLINE", "PHYSICAL", "HYBRID"] as const;

export function Marketplace() {
  const { opportunities, isLoading, createOpportunity, applyToOpportunity } =
    useOpportunities();
  const [selectedOpp, setSelectedOpp] = useState<string | null>(null);
  const [coverMessage, setCoverMessage] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    listingType: LISTING_TYPES[0] as string,
    mode: MODES[0] as string,
  });

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;
    try {
      await applyToOpportunity({ opportunityId: selectedOpp, coverMessage });
      setSelectedOpp(null);
      setCoverMessage("");
    } catch (err: any) {
      alert(
        err.response?.data?.error?.message || "Failed to submit application",
      );
    }
  };

  const handlePostListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOpportunity(newListing);
      setShowPostForm(false);
      setNewListing({
        title: "",
        description: "",
        listingType: LISTING_TYPES[0],
        mode: MODES[0],
      });
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to post listing");
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-stone-500">
        Loading marketplace listings...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg text-sm text-amber-800">
        <p className="font-bold">Academic Integrity Policy Reminder</p>
        <p>
          Tutoring, mentoring, and study groups are permitted. Contract
          cheating, exam impersonation, or completing graded assignments for
          others is strictly prohibited[cite: 2].
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">
          Tutor & Opportunity Marketplace
        </h1>
        <button
          onClick={() => setShowPostForm(true)}
          className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition"
        >
          Post a Listing
        </button>
      </div>

      {opportunities.length === 0 ? (
        <p className="text-center text-stone-500 py-12">
          No listings yet. Check back soon!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp: any) => (
            <div
              key={opp.id}
              className="bg-white border rounded-xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-xs uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                  {opp.listing_type} ({opp.mode})
                </span>
                <h3 className="text-lg font-bold text-stone-800 mt-2">
                  {opp.title}
                </h3>
                <p className="text-stone-600 text-sm mt-2 line-clamp-3">
                  {opp.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t flex justify-between items-center">
                <span className="text-xs text-stone-500">Posted recently</span>
                <button
                  onClick={() => setSelectedOpp(opp.id)}
                  className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition"
                >
                  Apply / Inquire
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOpp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-stone-900 mb-4">
              Submit Application
            </h3>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Cover Message / Approach
                </label>
                <textarea
                  rows={4}
                  value={coverMessage}
                  onChange={(e) => setCoverMessage(e.target.value)}
                  placeholder="Explain how you plan to help or collaborate..."
                  className="w-full border rounded-lg p-2 text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-stone-900 text-white rounded-lg hover:bg-stone-800"
                >
                  Send Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPostForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-stone-900 mb-4">
              Post a Listing
            </h3>
            <form onSubmit={handlePostListing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newListing.title}
                  onChange={(e) =>
                    setNewListing({ ...newListing, title: e.target.value })
                  }
                  placeholder="e.g. Need help with Calculus II"
                  className="w-full border rounded-lg p-2 text-sm"
                  required
                  minLength={5}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={newListing.description}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what you're looking for or offering..."
                  className="w-full border rounded-lg p-2 text-sm"
                  required
                  minLength={20}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newListing.listingType}
                    onChange={(e) =>
                      setNewListing({
                        ...newListing,
                        listingType: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2 text-sm"
                  >
                    {LISTING_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mode
                  </label>
                  <select
                    value={newListing.mode}
                    onChange={(e) =>
                      setNewListing({ ...newListing, mode: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 text-sm"
                  >
                    {MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostForm(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-stone-900 text-white rounded-lg hover:bg-stone-800"
                >
                  Post Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Marketplace;
