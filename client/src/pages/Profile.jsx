import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, KeyRound } from 'lucide-react';
import { getProfile, updateProfile } from '../api/userApi';
import { getErrorMessage } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { FullPageSpinner } from '../components/Spinner';

export default function Profile() {
  const { updateLocalUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [details, setDetails] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getProfile();
        setDetails({ name: data.data.name, email: data.data.email });
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setSavingDetails(true);
    try {
      const { data } = await updateProfile({ name: details.name, email: details.email });
      updateLocalUser({ name: data.data.name, email: data.data.email });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingDetails(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    try {
      await updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Profile</h2>
        <p className="mt-1 text-sm text-ink-soft">Manage your account details and password.</p>
      </div>

      <form onSubmit={handleDetailsSubmit} className="card space-y-4 p-6">
        <h3 className="font-display text-base font-semibold text-ink">Account details</h3>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
            Full name
          </label>
          <input
            id="name"
            type="text"
            className="input-field"
            value={details.name}
            onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            value={details.email}
            onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))}
            required
          />
        </div>
        <button
          type="submit"
          disabled={savingDetails}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Save size={15} /> {savingDetails ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card space-y-4 p-6">
        <h3 className="font-display text-base font-semibold text-ink">Change password</h3>
        <div>
          <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-ink">
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            className="input-field"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-ink">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            className="input-field"
            minLength={6}
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="input-field"
            minLength={6}
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            required
          />
        </div>
        <button
          type="submit"
          disabled={savingPassword}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <KeyRound size={15} /> {savingPassword ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
