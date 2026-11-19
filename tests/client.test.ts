import test from "node:test";
import assert from "node:assert/strict";
import { createCoreClient } from "../contracts/client.ts";

test('a delegated Core transport needs no fabricated static credential',async()=>{
 assert.throws(()=>createCoreClient({baseUrl:'http://127.0.0.1:4345'}),/access key/);
 let headers:Headers|undefined;
 const client=createCoreClient({baseUrl:'http://127.0.0.1:4345',fetcher:async(_url,options)=>{headers=new Headers(options?.headers);return Response.json([]);}});
 assert.deepEqual(await client.listContacts(),[]);assert.equal(headers?.get('authorization'),null);
});

test('Billing aggregate client validates selections and sends one scoped HTTP request',async()=>{
 const calls:string[]=[];
 const client=createCoreClient({baseUrl:'http://127.0.0.1:4345',fetcher:async input=>{calls.push(String(input));return Response.json({});}});
 await client.getBillingContext({companyId:'aaaaaaaa',financialYearId:'bbbbbbbb'});
 assert.deepEqual(calls,['http://127.0.0.1:4345/api/v1/billing-context?companyId=aaaaaaaa&financialYearId=bbbbbbbb']);
 assert.throws(()=>client.getBillingContext({companyId:'../tenant'}));
 assert.throws(()=>client.getBillingContext({tenantId:'other'} as any));
 assert.equal(calls.length,1);
});

test('bounded Billing clients validate catalogue queries, IDs and explicit currency selection',async()=>{
 const calls:string[]=[];const core=createCoreClient({baseUrl:'http://127.0.0.1:4345',fetcher:async input=>{calls.push(String(input));return Response.json({});}});
 await core.getBillingBootstrap({currencyCodes:['INR','USD']});
 await core.searchBillingContacts({q:'beyond first page',page:3,pageSize:100,role:'customer'});
 await core.searchBillingProducts({q:'fabric',page:2,pageSize:25});
 await core.getBillingContact('aaaaaaaa');await core.getBillingProduct('bbbbbbbb');
 assert.match(calls[0],/billing-bootstrap\?currencyCodes=INR%2CUSD$/);assert.match(calls[1],/q=beyond\+first\+page&page=3&pageSize=100&role=customer$/);
 for(const query of [{page:0},{page:-1},{pageSize:101},{q:'a'.repeat(81)},{sort:'name'},{tenantId:'foreign'}])assert.throws(()=>core.searchBillingProducts(query as any));
 for(const codes of [['INR','INR'],['inr'],Array.from({length:11},()=> 'USD')])assert.throws(()=>core.getBillingBootstrap({currencyCodes:codes}));
 await assert.rejects(core.getBillingContact('../foreign'));assert.equal(calls.length,5);
});

test("Billing read client uses server credentials, validates IDs and reports failures", async () => {
  const token = "test-only-key-".repeat(4);
  const requests: { url: string; authorization: string | null }[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    requests.push({
      url: String(input),
      authorization: new Headers(init?.headers).get("Authorization"),
    });
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const client = createCoreClient({
    baseUrl: "http://127.0.0.1:4406",
    token,
    fetcher,
  });
  await client.listCompanies();
  await client.listFinancialYears();
  await client.listContacts();
  assert.deepEqual(
    requests.map((value) => value.url),
    ["companies", "financial-years", "contacts"].map(
      (value) => "http://127.0.0.1:4406/api/v1/" + value,
    ),
  );
  assert.ok(
    requests.every((value) => value.authorization === "Bearer " + token),
  );
  await assert.rejects(client.getContact("../tenant-b"), /Invalid/);
  const denied = createCoreClient({
    baseUrl: "http://127.0.0.1:4406",
    token,
    fetcher: async () => new Response("", { status: 403 }),
  });
  await assert.rejects(denied.listContacts(), /403/);
  assert.throws(
    () => createCoreClient({ baseUrl: "http://127.0.0.1:4406/private", token }),
    /origin/,
  );
});
