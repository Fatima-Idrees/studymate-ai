import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { getProgress } from '../api/dashboardApi';
import { getErrorMessage } from '../api/apiClient';
import { FullPageSpinner } from '../components/Spinner';
import EmptyState from '../components/EmptyState';

const TopicPill = ({ topic, accuracy, tone }) => (
  <div
    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
      tone === 'weak' ? 'border-danger-soft bg-danger-soft/40' : 'border-success-soft bg-success-soft/40'
    }`}
  >
    <span className="font-medium text-ink">{topic}</span>
    <span className={`font-mono text-xs font-semibold ${tone === 'weak' ? 'text-danger' : 'text-success'}`}>
      {accuracy}%
    </span>
  </div>
);

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: res } = await getProgress();
        setData(res.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <FullPageSpinner />;

  const chartData = (data?.scoreHistory || []).map((s, idx) => ({
    name: `Quiz ${idx + 1}`,
    score: s.score,
    date: new Date(s.date).toLocaleDateString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Your progress</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Track quiz performance over time and spot the topics that need more work.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Total quizzes</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink">{data?.totalQuizzes ?? 0}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Notes uploaded</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink">{data?.totalNotesUploaded ?? 0}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Average score</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-primary">{data?.averageScore ?? 0}%</p>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-ink">
          <BarChart3 size={16} /> Score history
        </h3>
        {chartData.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No quiz scores yet"
            description="Take a quiz to start tracking your progress over time."
          />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e3db" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#57534e' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#57534e' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e7e3db', fontSize: 13 }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3730a3"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3730a3' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-danger">
            <TrendingDown size={15} /> Weak topics
          </h3>
          {!data?.weakTopics?.length ? (
            <p className="text-sm text-ink-soft">No weak topics identified yet — keep it up!</p>
          ) : (
            <div className="space-y-2">
              {data.weakTopics.map((t) => (
                <TopicPill key={t.topic} topic={t.topic} accuracy={t.accuracy} tone="weak" />
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-success">
            <TrendingUp size={15} /> Strong topics
          </h3>
          {!data?.strongTopics?.length ? (
            <p className="text-sm text-ink-soft">Take more quizzes to surface your strong topics.</p>
          ) : (
            <div className="space-y-2">
              {data.strongTopics.map((t) => (
                <TopicPill key={t.topic} topic={t.topic} accuracy={t.accuracy} tone="strong" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
