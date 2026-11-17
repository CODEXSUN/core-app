import { RecordDetailV1 } from "@workspace/ui/blocks/record-detail-v1";
import { MasterListStatus } from "@workspace/ui/blocks/data-table";
import type { Contact } from "../../../../../contracts/contact";
export function ContactShow({ record }: { record: Contact }) {
  return (
    <RecordDetailV1
      title={record.name}
      description={record.public_id}
      status={
        <MasterListStatus tone={record.active ? "success" : "neutral"}>
          {record.active ? "Active" : "Inactive"}
        </MasterListStatus>
      }
      sections={[
        {
          id: "details",
          title: "Details",
          fields: [
            { id: "code", label: "Code", value: record.code },
            { id: "legalName", label: "Legal name", value: record.legalName },
            { id: "role", label: "Role", value: record.role },
            { id: "typeId", label: "Contact type", value: record.typeName },
            { id: "groupId", label: "Contact group", value: record.groupName },
            { id: "gstin", label: "GSTIN", value: record.gstin },
            { id: "pan", label: "PAN", value: record.pan },
            { id: "website", label: "Website", value: record.website },
            { id: "description", label: "Notes", value: record.description },
            { id: "msmeNo", label: "MSME number", value: record.msmeNo },
            {
              id: "msmeCategory",
              label: "MSME category",
              value: record.msmeCategory,
            },
            { id: "tanNo", label: "TAN", value: record.tanNo },
            {
              id: "tdsAvailable",
              label: "TDS available",
              value: record.tdsAvailable ? "Yes" : "No",
            },
            {
              id: "tcsAvailable",
              label: "TCS available",
              value: record.tcsAvailable ? "Yes" : "No",
            },
            {
              id: "creditLimit",
              label: "Credit limit",
              value: record.creditLimit,
            },
          ],
        },
        {
          id: "party-details",
          title: "Contact and bank details",
          fields: [
            {
              id: "emails",
              label: "Emails",
              value: record.emails.map((value) => value.email).join(", "),
            },
            {
              id: "phones",
              label: "Phones",
              value: record.phones.map((value) => value.phone).join(", "),
            },
            {
              id: "addresses",
              label: "Addresses",
              value: record.addresses.length
                ? record.addresses.map((value, i) => (
                    <p key={i}>
                      {[
                        value.label,
                        value.addressLine1,
                        value.addressLine2,
                        value.city,
                        value.state,
                        value.postalCode,
                        value.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  ))
                : "—",
            },
            {
              id: "banks",
              label: "Bank accounts",
              value: record.bankAccounts.length
                ? record.bankAccounts.map((value, i) => (
                    <p key={i}>
                      {[
                        value.bankName,
                        value.accountNumber,
                        value.holderName,
                        value.ifsc,
                        value.branch,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ))
                : "—",
            },
            {
              id: "social",
              label: "Social links",
              value: record.socialLinks
                .map((value) => value.platform + ": " + value.url)
                .join(", "),
            },
          ],
        },
        {
          id: "audit",
          title: "Record history",
          fields: [
            {
              id: "created",
              label: "Created",
              value: new Date(record.created_at).toLocaleString(),
            },
            { id: "creator", label: "Created by", value: record.created_by },
            {
              id: "updated",
              label: "Updated",
              value: new Date(record.updated_at).toLocaleString(),
            },
            { id: "updater", label: "Updated by", value: record.updated_by },
          ],
        },
      ]}
    />
  );
}
