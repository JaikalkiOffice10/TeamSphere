import ProjectCard from "./ProjectCard";

// Same props as the old ProjectTable, plus teamKey. Renders the projects as a responsive card grid.
export default function ProjectGrid({ projects, companyNames, showBudget = true, teamKey = 0, ...actions }) {
  if (projects.length === 0) return <p className="empty">No projects found.</p>;
  return (
    <div className="project-grid">
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          project={p}
          companyName={companyNames ? companyNames[p.company_id] || `#${p.company_id}` : undefined}
          showBudget={showBudget}
          teamKey={teamKey}
          {...actions}
        />
      ))}
    </div>
  );
}
