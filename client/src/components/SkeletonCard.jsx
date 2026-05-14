const SkeletonCard = () => (
  <div style={{ background:"var(--surface-1)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", overflow:"hidden" }}>
    <div style={{ height:4, background:"var(--surface-3)" }} />
    <div style={{ padding:"1.4rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1rem" }}>
        <div className="skeleton" style={{ width:80, height:22 }} />
        <div className="skeleton" style={{ width:20, height:20, borderRadius:"50%" }} />
      </div>
      <div className="skeleton" style={{ height:20, marginBottom:"0.6rem" }} />
      <div className="skeleton" style={{ height:14, marginBottom:"0.4rem" }} />
      <div className="skeleton" style={{ height:14, width:"70%", marginBottom:"1.2rem" }} />
      <div className="skeleton" style={{ height:44, borderRadius:"var(--r-md)", marginBottom:"1.2rem" }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div className="skeleton" style={{ width:70, height:28 }} />
        <div className="skeleton" style={{ width:88, height:34, borderRadius:"var(--r-md)" }} />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
