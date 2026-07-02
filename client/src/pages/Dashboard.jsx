import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Brain, TrendingUp, UploadCloud, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDashboard } from '../api/dashboardApi';
import { getErrorMessage } from '../api/apiClient';
import { FullPageSpinner } from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="card flex items-center gap-4 p-5">
    <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="font-mono text-2xl font-semibold text-ink">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: res } = await getDashboard();
        setData(res.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">
          Welcome back, {data?.welcomeName || user?.name?.split(' ')[0]}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">Here's where your studying stands today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={FileText}
          label="Notes Uploaded"
          value={data?.totalNotes ?? 0}
          accent="bg-primary-soft text-primary"
        />
        <StatCard
          icon={Brain}
          label="Quizzes Generated"
          value={data?.totalQuizzes ?? 0}
          accent="bg-accent-soft text-accent"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={`${data?.averageScore ?? 0}%`}
          accent="bg-success-soft text-success"
        />
      </div>

      <div className="card p-5">
        <h3 className="mb-4 font-display text-base font-semibold text-ink">Recent activity</h3>

        {!data?.recentActivity?.length ? (
          <EmptyState
            icon={UploadCloud}
            title="No activity yet"
            description="Upload your first set of notes to get started."
            action={
              <Link to="/upload" className="btn-primary px-4 py-2 text-sm">
                Upload notes
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {data.recentActivity.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-dim text-ink-soft">
                  {item.type === 'note_upload' ? <FileText size={15} /> : <Brain size={15} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-xs text-ink-soft">
                    {item.type === 'note_upload'
                      ? 'Uploaded note'
                      : item.submitted
                      ? `Quiz completed · ${item.score ?? '—'}%`
                      : 'Quiz generated'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-ink-soft">
                  <Clock size={12} />
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
