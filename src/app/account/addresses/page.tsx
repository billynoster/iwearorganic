'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { AccountShell } from '@/components/account/account-shell';
import { RequireSignedIn } from '@/components/account/require-signed-in';
import {
  emptyAddress,
  formatAddressLines,
  type SavedAddress,
} from '@/lib/account-address';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AccountAddressesPage() {
  return (
    <RequireSignedIn>
      <AddressesContent />
    </RequireSignedIn>
  );
}

function AddressesContent() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !firestore) return;

    const load = async () => {
      setLoading(true);
      try {
        const userRef = doc(firestore, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          setAddresses([]);
          return;
        }
        const data = snap.data();
        if (Array.isArray(data.addresses) && data.addresses.length > 0) {
          setAddresses(data.addresses as SavedAddress[]);
        } else if (data.shippingInfo && typeof data.shippingInfo === 'object') {
          const legacy = data.shippingInfo as Partial<SavedAddress>;
          setAddresses([
            {
              ...emptyAddress(true),
              ...legacy,
              id: 'default',
              isDefaultShipping: true,
              isDefaultBilling: true,
            },
          ]);
        } else {
          setAddresses([]);
        }
      } catch (err) {
        console.error(err);
        toast({
          variant: 'destructive',
          title: 'Could not load addresses',
          description: 'Refresh and try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user, firestore, toast]);

  const persist = async (next: SavedAddress[]) => {
    if (!user || !firestore) return;
    setSaving(true);
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, { addresses: next }, { merge: true });
      setAddresses(next);
      setEditing(null);
      toast({ title: 'Address saved', description: 'Ready for faster checkout.' });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: 'Could not update your address book.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;

    let next = [...addresses];
    if (editing.isDefaultShipping) {
      next = next.map((a) => ({ ...a, isDefaultShipping: false }));
    }
    if (editing.isDefaultBilling) {
      next = next.map((a) => ({ ...a, isDefaultBilling: false }));
    }

    const withId: SavedAddress = {
      ...editing,
      id: editing.id || `addr_${Date.now()}`,
    };

    const idx = next.findIndex((a) => a.id === withId.id);
    if (idx >= 0) next[idx] = withId;
    else next.push(withId);

    if (next.length === 1) {
      next[0]!.isDefaultShipping = true;
      next[0]!.isDefaultBilling = true;
    }

    await persist(next);
  };

  const handleDelete = async (id: string) => {
    const next = addresses.filter((a) => a.id !== id);
    if (next.length === 1) {
      next[0]!.isDefaultShipping = true;
      next[0]!.isDefaultBilling = true;
    }
    await persist(next);
  };

  return (
    <AccountShell
      title="Addresses."
      description="Save a default shipping address to speed up Stripe checkout. Guest checkout still works without one."
      email={user?.email}
    >
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="font-body text-sm text-mineral-ink/60">
          {addresses.length === 0
            ? 'No saved addresses yet.'
            : `${addresses.length} saved address${addresses.length === 1 ? '' : 'es'}.`}
        </p>
        {!editing ? (
          <button
            type="button"
            className="ca-btn-primary"
            onClick={() => setEditing(emptyAddress(addresses.length === 0))}
          >
            Add address
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="font-body text-sm text-mineral-ink/60">Loading addresses…</p>
      ) : null}

      {editing ? (
        <form
          onSubmit={handleSave}
          className="mb-10 max-w-2xl space-y-4 border border-oat bg-[color-mix(in_srgb,var(--ca-linen)_70%,var(--ca-oat))] p-6"
        >
          <h2 className="ca-heading text-h3">
            {editing.id ? 'Edit address' : 'New address'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="First name"
              value={editing.firstName}
              onChange={(v) => setEditing({ ...editing, firstName: v })}
              required
            />
            <Field
              label="Last name"
              value={editing.lastName}
              onChange={(v) => setEditing({ ...editing, lastName: v })}
              required
            />
          </div>
          <Field
            label="Address line 1"
            value={editing.address1}
            onChange={(v) => setEditing({ ...editing, address1: v })}
            required
          />
          <Field
            label="Address line 2"
            value={editing.address2}
            onChange={(v) => setEditing({ ...editing, address2: v })}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="City"
              value={editing.city}
              onChange={(v) => setEditing({ ...editing, city: v })}
              required
            />
            <Field
              label="State"
              value={editing.state}
              onChange={(v) => setEditing({ ...editing, state: v })}
              required
            />
            <Field
              label="ZIP"
              value={editing.zip}
              onChange={(v) => setEditing({ ...editing, zip: v })}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Country"
              value={editing.country}
              onChange={(v) => setEditing({ ...editing, country: v })}
              required
            />
            <Field
              label="Phone"
              value={editing.phone}
              onChange={(v) => setEditing({ ...editing, phone: v })}
              type="tel"
            />
          </div>

          <div className="space-y-3 border-y border-oat py-4">
            <label className="flex items-center justify-between gap-4 font-body text-sm">
              <span>Default shipping</span>
              <input
                type="checkbox"
                checked={editing.isDefaultShipping}
                onChange={(e) =>
                  setEditing({ ...editing, isDefaultShipping: e.target.checked })
                }
                className="h-4 w-4 accent-mineral-ink"
              />
            </label>
            <label className="flex items-center justify-between gap-4 font-body text-sm">
              <span>Default billing</span>
              <input
                type="checkbox"
                checked={editing.isDefaultBilling}
                onChange={(e) =>
                  setEditing({ ...editing, isDefaultBilling: e.target.checked })
                }
                className="h-4 w-4 accent-mineral-ink"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className={cn('ca-btn-primary', saving && 'opacity-60')}
            >
              {saving ? 'Saving…' : 'Save address'}
            </button>
            <button
              type="button"
              className="ca-btn-secondary"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {!loading && !editing ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id} className="border border-oat p-6">
              <div className="flex flex-wrap gap-2">
                {address.isDefaultShipping ? (
                  <span className="ca-eyebrow text-mineral-ink">Default shipping</span>
                ) : null}
                {address.isDefaultBilling ? (
                  <span className="ca-eyebrow text-mineral-ink/55">Default billing</span>
                ) : null}
              </div>
              <div className="mt-3 space-y-1 font-body text-sm text-mineral-ink/80">
                {formatAddressLines(address).map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {address.phone ? <p className="pt-2">{address.phone}</p> : null}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  className="ca-btn-secondary"
                  onClick={() => setEditing(address)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="font-body text-sm text-mineral-ink/55 underline-offset-4 hover:text-mineral-ink hover:underline"
                  onClick={() => void handleDelete(address.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </AccountShell>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      <label htmlFor={id} className="ca-field-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border border-oat bg-linen px-3 py-2.5 font-body text-sm text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
      />
    </div>
  );
}
