import Image from "next/image";
import Link from "next/link";
import { Breadcrumb, CoronShell } from "@/components/coron/CoronShell";

const cards=[["service2.jpg","DESIGN THE COVER"],["service1.jpg","BUILD YOUR BRAND"],["service3.jpg","CREATE THE EXPERIENCE"]];
const services=["Branding","Web design","Photography","Web development","Coding","Marketing","Support","Graphic design"];
export default function ServicesPage(){return <CoronShell><Breadcrumb title="Services"/><main className="coron-container coron-content coron-article">
  <section className="coron-products">{cards.map(([image,title])=><article className="coron-card" key={title}><Image src={`/coron/img/services/${image}`} alt="" width={350} height={230}/><div className="coron-cardbody"><h3>{title}</h3><p>Mirum est notare quam littera gothica, quam nunc putamus parum claram, anteposuerit litterarum formas.</p></div></article>)}</section>
  <section style={{margin:"50px 0"}}><div className="coron-center"><h2>OUR SERVICES</h2><p>Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat.</p></div><div className="coron-products" style={{marginTop:25}}>{services.map((name,i)=><article className="coron-cardbody coron-center" key={name}><div className="coron-price">{["◆","◈","●","⚙","⌘","▥","♬","✦"][i]}</div><h3>{name.toUpperCase()}</h3><p>Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem.</p></article>)}</div></section>
  <section className="coron-two"><Image src="/coron/img/services/service4.jpg" alt="Unlimited creative ideas" width={555} height={370}/><div><h1>UNLIMITED IDEAS</h1><p>Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming.</p><Link className="coron-btn" href="/contact">More info</Link></div></section>
  </main></CoronShell>}
