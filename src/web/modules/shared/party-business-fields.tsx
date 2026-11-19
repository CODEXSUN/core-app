import { Button, Input, Switch } from "@workspace/ui";
import {
  UpsertFormField,
  UpsertFormSection,
} from "@workspace/ui/blocks/upsert-form";
import {ReferencePicker} from './reference-picker';
import type { BankAccount, SocialLink } from "../../../../contracts/party";
import {loadBankNameReferencePage,getBankNameReference} from '../common/bank-name';

export function PartyBusinessFields({
  id,
  bankAccounts,
  socialLinks,
  errors,
  onChange,
}: {
  id: string;
  bankAccounts: BankAccount[];
  socialLinks: SocialLink[];
  errors: Record<string, string>;
  onChange: (patch: {
    bankAccounts?: BankAccount[];
    socialLinks?: SocialLink[];
  }) => void;
}) {
  return (
    <>
      <UpsertFormSection label="Bank accounts">
        {errors.bankAccounts && (
          <p role="alert">{errors.bankAccounts}</p>
        )}
        {bankAccounts.map((account, index) => {
          const update = (patch: Partial<BankAccount>) =>
            onChange({
              bankAccounts: bankAccounts.map((value, i) =>
                i === index ? { ...value, ...patch } : value,
              ),
            });
          return (
            <div key={index} className="space-y-3">
              <UpsertFormField
                idPrefix={id}
                name={"bank-" + index}
                label="Bank reference"
                helper="Choose a bank, or retain an existing free-text bank name."
              >
                <ReferencePicker
                  ariaLabel={"Bank " + (index + 1)}
                  loadPage={loadBankNameReferencePage}
                  loadSelected={getBankNameReference}
                  value={account.bankNameId}
                  onValueChange={(value, option) =>
                    update({
                      bankNameId: value,
                      bankName: option?.name ?? account.bankName,
                    })
                  }
                />
              </UpsertFormField>
              {(
                [
                  "bankName",
                  "accountType",
                  "accountNumber",
                  "holderName",
                  "ifsc",
                  "branch",
                ] as const
              ).map((field) => (
                <UpsertFormField
                  key={field}
                  idPrefix={id}
                  name={"bank-" + index + "-" + field}
                  label={
                    {
                      bankName: "Bank name",
                      accountType: "Account type",
                      accountNumber: "Account number",
                      holderName: "Account holder",
                      ifsc: "IFSC",
                      branch: "Branch",
                    }[field]
                  }
                  helper="Enter the account detail."
                  required={field === "accountNumber"}
                >
                  <Input
                    value={account[field]}
                    disabled={
                      field === "bankName" && Boolean(account.bankNameId)
                    }
                    onChange={(event) =>
                      update({ [field]: event.target.value })
                    }
                  />
                </UpsertFormField>
              ))}
              <div className="flex items-center gap-3">
                <Switch
                  aria-label={"Primary bank account " + (index + 1)}
                  checked={account.isPrimary}
                  onCheckedChange={(checked) =>
                    onChange({
                      bankAccounts: bankAccounts.map((value, i) => ({
                        ...value,
                        isPrimary: i === index ? checked : false,
                      })),
                    })
                  }
                />
                <span>Primary account</span>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() =>
                    onChange({
                      bankAccounts: bankAccounts.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove account {index + 1}
                </Button>
              </div>
            </div>
          );
        })}
        <Button
          variant="outline"
          type="button"
          disabled={bankAccounts.length >= 20}
          onClick={() =>
            onChange({
              bankAccounts: [
                ...bankAccounts,
                {
                  bankNameId: "",
                  bankName: "",
                  accountType: "",
                  accountNumber: "",
                  holderName: "",
                  ifsc: "",
                  branch: "",
                  isPrimary: !bankAccounts.length,
                },
              ],
            })
          }
        >
          Add bank account
        </Button>
      </UpsertFormSection>
      <UpsertFormSection label="Social links">
        {errors.socialLinks && <p role="alert">{errors.socialLinks}</p>}
        {socialLinks.map((link, index) => {
          const update = (patch: Partial<SocialLink>) =>
            onChange({
              socialLinks: socialLinks.map((value, i) =>
                i === index ? { ...value, ...patch } : value,
              ),
            });
          return (
            <div key={index} className="space-y-3">
              <UpsertFormField
                idPrefix={id}
                name={"social-platform-" + index}
                label="Platform"
                helper="Enter the social platform name."
                required
              >
                <Input
                  value={link.platform}
                  onChange={(event) => update({ platform: event.target.value })}
                />
              </UpsertFormField>
              <UpsertFormField
                idPrefix={id}
                name={"social-url-" + index}
                label="Link"
                helper="Use an HTTP or HTTPS link."
                required
              >
                <Input
                  type="url"
                  value={link.url}
                  onChange={(event) => update({ url: event.target.value })}
                />
              </UpsertFormField>
              <Switch
                aria-label={"Social link " + (index + 1) + " active"}
                checked={link.active}
                onCheckedChange={(active) => update({ active })}
              />
              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  onChange({
                    socialLinks: socialLinks.filter((_, i) => i !== index),
                  })
                }
              >
                Remove link {index + 1}
              </Button>
            </div>
          );
        })}
        <Button
          variant="outline"
          type="button"
          disabled={socialLinks.length >= 20}
          onClick={() =>
            onChange({
              socialLinks: [
                ...socialLinks,
                { platform: "", url: "", active: true },
              ],
            })
          }
        >
          Add social link
        </Button>
      </UpsertFormSection>
    </>
  );
}
