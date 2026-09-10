import { useState } from "react";
import { useModeration } from "../../hooks/useModeration";
import axios from "axios";
import type { ModerationQueueItem } from "../../types/moderation";
import { AdminPageShell } from "../../layouts/AdminPageShell";

export function AdminModerationQueue({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { queue, isLoadingQueue, handleAction } = useModeration();
  const [reason, setReason] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onSubmitAction = async (
    targetType: string,
    id: string,
    action: string,
  ) => {
    if (!reason || reason.length < 5) {
      alert(
        "A mandatory reason (minimum 5 characters) is required for audit logging.",
      );
      return;
    }
    try {
      await handleAction({ targetType, id, action, reason });
      setSelectedId(null);
      setReason("");
      alert("Moderation decision successfully audited and applied.");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { error?: { message?: string } })?.error
            ?.message
        : undefined;
      alert(message || "Failed to process action");
    }
  };

  if (isLoadingQueue) {
    return (
      <AdminPageShell embedded={embedded}>
        <div className="p-8 text-center text-stone-500">
          Loading moderation queue...
        </div>
      </AdminPageShell>
    );
  }
  return (
    <AdminPageShell embedded={embedded}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">
          Admin Moderation Queue
        </h1>
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          {queue.length === 0 ? (
            <p className="p-6 text-stone-500 text-center">
              No pending items in the moderation queue.
            </p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b text-stone-700 text-sm">
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Reason / Details</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item: ModerationQueueItem) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-stone-50 text-sm"
                  >
                    <td className="p-4 font-medium uppercase">
                      {item.entity_type}
                    </td>
                    <td className="p-4 text-stone-600">{item.details}</td>

                    <td className="p-4">
                      {selectedId === item.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Audit reason (min 5 chars)..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="border p-1 text-xs rounded w-full"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                onSubmitAction(
                                  item.entity_type,
                                  item.entity_id,
                                  "approve",
                                )
                              }
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                onSubmitAction(
                                  item.entity_type,
                                  item.entity_id,
                                  "reject",
                                )
                              }
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => setSelectedId(null)}
                              className="text-stone-500 text-xs px-2"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedId(item.id)}
                          className="bg-stone-800 text-white px-3 py-1 rounded text-xs"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}

export default AdminModerationQueue;
