type Props = {
  email: string;
  returnTo: string;
};

export function ActivatePaidAccountButton({ email, returnTo }: Props) {
  return (
    <form action="/api/account/activate" method="post" className="activate-paid-account-form">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="return_to" value={returnTo} />
      <button type="submit" className="button-link">
        Créer mon compte sans email
      </button>
    </form>
  );
}
