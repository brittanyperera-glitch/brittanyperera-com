import { MacIcon } from "@/components/icons/MacIcon";
import { copy } from "@/content/copy";
import "@/styles/platinum.css";
import "@/styles/desktop.css";
import "@/styles/alert.css";
import "@/styles/setup.css";

// Static on purpose: no provider, no state, so a 404 renders even if everything else is broken.
export default function NotFound() {
  const crash = copy.alerts.crash;
  return (
    <div className="desktop">
      <div className="nf-layer">
        <div className="alert bevel" role="alertdialog" aria-labelledby="nf-body">
          <MacIcon name="bomb" size={40} />
          <div className="alert-main">
            <div id="nf-body">
              <b>{crash.title}</b>
              <br />
              {crash.text}
            </div>
            <div className="alert-buttons">
              <a className="pbtn default nf-restart" href="/">
                {crash.button}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
