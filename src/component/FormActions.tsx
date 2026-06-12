'use client';

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isLoading?: boolean;
  submitDisabled?: boolean;
  submitLabel?: string;
}

export default function FormActions({
  onCancel,
  isSubmitting,
  isLoading = false,
  submitDisabled = false,
  submitLabel = 'Save',
}: FormActionsProps) {
  return (
    <div className="formActions">
      <button type="button" className="secondaryButton" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </button>
      <button
        type="submit"
        className="primaryButton"
        disabled={isLoading || isSubmitting || submitDisabled}
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </div>
  );
}
