import React from "react";
import "./Documentation.css";

const Documentation: React.FC = () => {
  return (
    <div className="layout">

      {/* ---------- Sidebar ---------- */}
      <aside className="doc-sidebar">
        <h3>📘 Documentation</h3>
        <ul>
          <li><a href="#select">Step 2 — Select MRI</a></li>
          <li><a href="#overview">Interface Overview</a></li>
          <li><a href="#perform">Performing Segmentation</a></li>
          <li><a href="#structures">Structures</a></li>
        </ul>
      </aside>

      {/* ---------- Main Content ---------- */}
      <main className="content">

        {/* Section: Select MRI */}
        <section id="select" className="card">
          <h2>Step 2 — Select an MRI</h2>
          <p>
            Each user has a predefined set of MRI scans assigned by the system administrator.
            Select any MRI to load it into your workspace.
          </p>
        </section>

        {/* Section: Interface Overview */}
        <section id="overview" className="card">
          <h2>4. Interface Overview</h2>

          <table>
            <thead>
              <tr>
                <th>Section</th>
                <th>Description</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Navigation Bar</td>
                <td>Access your account, logout, or help documentation.</td>
              </tr>
              <tr>
                <td>MRI Viewer</td>
                <td>Displays the MRI image slice-by-slice or volume view.</td>
              </tr>
              <tr>
                <td>Segmentation Panel</td>
                <td>Tools to start, view, and edit segmentation masks.</td>
              </tr>
              <tr>
                <td>Output & Notifications</td>
                <td>Displays results, progress messages, and alerts.</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Section: Performing Segmentation */}
        <section id="perform" className="card">
          <h2>5. Performing Segmentation</h2>

          <details open>
            <summary>Step 1 — Load the MRI</summary>
            <p>After selecting a scan, it appears automatically in the viewer.</p>
          </details>

          <details>
            <summary>Step 2 — Choose a Target Structure</summary>
            <p>Select a structure to start the segmentation process.</p>
          </details>
        </section>

        {/* Section: Structures */}
        <section id="structures" className="card">
          <h2>Target Structures</h2>

          <p><span className="tag green">STN</span> Subthalamic Nucleus</p>
          <p><span className="tag yellow">GPI</span> Globus Pallidus Internus</p>
          <p><span className="tag red">RN</span> Red Nucleus</p>
        </section>

      </main>
    </div>
  );
};

export default Documentation;
