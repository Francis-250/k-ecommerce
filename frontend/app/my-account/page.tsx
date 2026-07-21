"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";

const tabs = [
  "dashboard",
  "orders",
  "downloads",
  "address",
  "account-details",
] as const;
type Tab = (typeof tabs)[number];
const labels: Record<Tab, string> = {
  dashboard: "Dashboard",
  orders: "Orders",
  downloads: "Downloads",
  address: "Addresses",
  "account-details": "Account details",
};

export default function MyAccountPage() {
  const [active, setActive] = useState<Tab>("dashboard");
  return (
    <StorefrontShell>
      <Breadcrumb title="My account" />
      <section className="main_content_area">
        <div className="account_dashboard">
          <div className="row">
            <div className="col-sm-12 col-md-3 col-lg-3">
              <div className="dashboard_tab_button">
                <ul role="tablist" className="nav flex-column dashboard-list">
                  {tabs.map((tab) => (
                    <li key={tab}>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={active === tab}
                        onClick={() => setActive(tab)}
                        className={`nav-link${active === tab ? " active" : ""}`}
                      >
                        {labels[tab]}
                      </button>
                    </li>
                  ))}
                  <li>
                    <Link href="/login" className="nav-link">
                      logout
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-sm-12 col-md-9 col-lg-9">
              <div className="tab-content dashboard_content">
                {active === "dashboard" && (
                  <div className="tab-pane fade show active">
                    <h3>Dashboard </h3>
                    <p>
                      From your account dashboard. you can easily check &amp;
                      view your{" "}
                      <button type="button" onClick={() => setActive("orders")}>
                        recent orders
                      </button>
                      , manage your{" "}
                      <button
                        type="button"
                        onClick={() => setActive("address")}
                      >
                        shipping and billing addresses
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={() => setActive("account-details")}
                      >
                        Edit your password and account details.
                      </button>
                    </p>
                  </div>
                )}
                {active === "orders" && (
                  <div className="tab-pane fade show active">
                    <h3>Orders</h3>
                    <AccountTable
                      headings={["Order", "Date", "Status", "Total", "Actions"]}
                      rows={[
                        [
                          "1",
                          "May 10, 2023",
                          "Completed",
                          "$25.00 for 1 item",
                          "view",
                        ],
                        [
                          "2",
                          "May 10, 2023",
                          "Processing",
                          "$17.00 for 1 item",
                          "view",
                        ],
                      ]}
                    />
                  </div>
                )}
                {active === "downloads" && (
                  <div className="tab-pane fade show active">
                    <h3>Downloads</h3>
                    <AccountTable
                      headings={["Product", "Downloads", "Expires", "Download"]}
                      rows={[
                        [
                          "Shopnovilla - Free Real Estate PSD Template",
                          "May 10, 2023",
                          "Expired",
                          "Click Here To Download Your File",
                        ],
                        [
                          "Organic - ecommerce html template",
                          "Sep 11, 2023",
                          "Never",
                          "Click Here To Download Your File",
                        ],
                      ]}
                    />
                  </div>
                )}
                {active === "address" && (
                  <div className="tab-pane fade show active">
                    <p>
                      The following addresses will be used on the checkout page
                      by default.
                    </p>
                    <h4 className="billing-address">Billing address</h4>
                    <a href="#edit" className="view">
                      Edit
                    </a>
                    <p>
                      <strong>Bobby Jackson</strong>
                    </p>
                    <address>
                      House #15
                      <br />
                      Road #1
                      <br />
                      Block #C
                      <br />
                      Banasree
                      <br />
                      Dhaka
                      <br />
                      1212
                    </address>
                    <p>Bangladesh</p>
                  </div>
                )}
                {active === "account-details" && (
                  <div className="tab-pane fade show active">
                    <h3>Account details </h3>
                    <div className="login">
                      <div className="login_form_container">
                        <div className="account_login_form">
                          <form>
                            <p>
                              Already have an account?{" "}
                              <Link href="/login">Log in instead!</Link>
                            </p>
                            <div className="input-radio">
                              <label className="custom-radio">
                                <input type="radio" value="mr" name="gender" />{" "}
                                Mr.
                              </label>{" "}
                              <label className="custom-radio">
                                <input type="radio" value="mrs" name="gender" />{" "}
                                Mrs.
                              </label>
                            </div>
                            <br />
                            <DetailField name="first-name" label="First Name" />
                            <DetailField name="last-name" label="Last Name" />
                            <DetailField
                              name="email-name"
                              label="Email"
                              type="email"
                            />
                            <DetailField
                              name="user-password"
                              label="Password"
                              type="password"
                            />
                            <DetailField
                              name="birthday"
                              label="Birthdate"
                              placeholder="MM/DD/YYYY"
                            />
                            <span className="example">(E.g.: 05/31/1970)</span>
                            <br />
                            <label className="custom_checkbox">
                              <input type="checkbox" name="optin" /> Receive
                              offers from our partners
                            </label>
                            <br />
                            <label className="custom_checkbox">
                              <input type="checkbox" name="newsletter" /> Sign
                              up for our newsletter
                              <br />
                              <em>
                                You may unsubscribe at any moment. For that
                                purpose, please find our contact info in the
                                legal notice.
                              </em>
                            </label>
                            <div className="save_button primary_btn default_button">
                              <button type="submit">Save</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}

function AccountTable({
  headings,
  rows,
}: {
  headings: string[];
  rows: string[][];
}) {
  return (
    <div className="coron_table table-responsive">
      <table className="table">
        <thead>
          <tr>
            {headings.map((x) => (
              <th key={x}>{x}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>
                  {j === row.length - 1 ? (
                    <a href={j === 4 ? "/cart" : "#download"} className="view">
                      {cell}
                    </a>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function DetailField({
  name,
  label,
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <>
      <label htmlFor={name}>{label}</label>
      <input id={name} type={type} name={name} placeholder={placeholder} />
    </>
  );
}
