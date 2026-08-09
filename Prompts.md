jwt.ts: Argument of type 'JwtPayload' is not assignable to parameter of type 'JWTPayload'.
  Index signature for type 'string' is missing in type 'JwtPayload'.
Conversion of type 'JWTPayload' to type 'JwtPayload' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'JWTPayload' is missing the following properties from type 'JwtPayload': userId, email, role

user service: Argument of type '{ name: string; email: string; password: string; role: "CLIENT"; isActive: true; refreshToken: null; lastLogin: null; }' is not assignable to parameter of type '{ name: string; email: string; password: string; role: "ADMIN" | "CLIENT"; isActive: boolean; refreshToken?: string | null | undefined; lastLogin?: NativeDate | null | undefined; } & DefaultTimestampProps'.
  Type '{ name: string; email: string; password: string; role: "CLIENT"; isActive: true; refreshToken: null; lastLogin: null; }' is missing the following properties from type 'DefaultTimestampProps': createdAt, updatedAt

user controller: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.

Argument of type '{ invoiceNumber: string; clientId: Types.ObjectId; issueDate: Date; dueDate: Date; items: { description: string; quantity: number; unitPrice: number; amount: number; }[]; subtotal: number; ... 6 more ...; paidAt: null; }' is not assignable to parameter of type 'Invoice'.
  Type '{ invoiceNumber: string; clientId: ObjectId; issueDate: Date; dueDate: Date; items: { description: string; quantity: number; unitPrice: number; amount: number; }[]; subtotal: number; ... 6 more ...; paidAt: null; }' is missing the following properties from type 'Invoice': createdAt, updatedAt

  Argument of type 'Record<string, unknown> | { dueDate?: Date | undefined; items?: { description: string; quantity: number; unitPrice: number; }[] | undefined; taxRate?: number | undefined; }' is not assignable to parameter of type 'Partial<Invoice>'.

  Type '{ dueDate?: Date | undefined; items?: { description: string; quantity: number; unitPrice: number; }[] | undefined; taxRate?: number | undefined; }' is not assignable to type 'Partial<Invoice>'.

    Types of property 'items' are incompatible.

      Type '{ description: string; quantity: number; unitPrice: number; }[] | undefined' is not assignable to type 'InvoiceItem[] | undefined'.

        Type '{ description: string; quantity: number; unitPrice: number; }[]' is not assignable to type 'InvoiceItem[]'.

          Property 'amount' is missing in type '{ description: string; quantity: number; unitPrice: number; }' but required in type 'InvoiceItem'.

invoice.model.ts(150, 3): 'amount' is declared here.

in components/client/invoicesummarycards: Property 'currency' does not exist on type '{ readonly key: "totalInvoices"; readonly label: "Total Invoices"; } | { readonly key: "draft"; readonly label: "Draft"; } | { readonly key: "issued"; readonly label: "Issued"; } | { readonly key: "paid"; readonly label: "Paid"; } | { ...; } | { ...; }'.

  Property 'currency' does not exist on type '{ readonly key: "totalInvoices"; readonly label: "Total Invoices"; }'.



and similar error in client dashboard page: 

Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:

- Update external systems with the latest state from React.
- Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. ([https://react.dev/learn/you-might-not-need-an-effect](https://react.dev/learn/you-might-not-need-an-effect)).

C:\Users\91746\Desktop\DESKTOP\PRODESK\Mission20\Nexus-billing-portal\client\src\app\client\dashboard\page.tsx:63:10
61 |
62 |   useEffect(() => {

> 63 |     void loadDashboard();
> \|          ^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
> 64 |   }, [loadDashboard]);
> 65 |
> 66 |   async function handleDownload(
>
>  and a warning: Do not use `window.location.href` to navigate to internal Next.js pages. Use `redirect()` in the render phase, or `useRouter().push()` in Client Components' event handlers instead. See: [https://nextjs.org/docs/messages/no-location-assign-relative-destination](https://nextjs.org/docs/messages/no-location-assign-relative-destination)

