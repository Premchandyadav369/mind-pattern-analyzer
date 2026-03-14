import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, BookOpen, FlaskConical } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

type TeamType = "theory" | "lab";

interface Member {
  name: string;
  regNo: string;
  role: string;
}

const THEORY_TEAM: Member[] = [
  { name: "V C Premchand Yadav", regNo: "23BCE7167", role: "Project Lead & Architect" },
  { name: "Sembilli Hemanth", regNo: "23BCE20054", role: "NLP Pipeline Engineer" },
  { name: "Suryeswara Reddy P", regNo: "23BCE7050", role: "Bias Classification Researcher" },
  { name: "Bandi Saana Dinesh Reddy", regNo: "23BCE20182", role: "Quantum Cognition Modeler" },
];

const LAB_TEAM: Member[] = [
  { name: "V C Premchand Yadav", regNo: "23BCE7167", role: "Lead Developer & System Integrator" },
  { name: "Y Liel Stephen", regNo: "23BCE20073", role: "Frontend & Visualization Engineer" },
  { name: "Swapnil Mondal", regNo: "23BCE9239", role: "Edge Function & API Developer" },
  { name: "P Gomathi Krishna", regNo: "23BCE7981", role: "ML Model & Data Pipeline Engineer" },
  { name: "Riya Pawar", regNo: "23BCE8282", role: "UI/UX Designer & Testing Lead" },
];

const TeamCredits = () => {
  const [activeTeam, setActiveTeam] = useState<TeamType>("theory");
  const { isQuantum } = useTheme();
  const team = activeTeam === "theory" ? THEORY_TEAM : LAB_TEAM;

  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">
            Contributors
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>Team</span> Members
          </h2>
        </motion.div>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-xl border border-border/50 bg-muted/20 p-1 gap-1">
            <button
              onClick={() => setActiveTeam("theory")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTeam === "theory"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Theory
            </button>
            <button
              onClick={() => setActiveTeam("lab")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTeam === "lab"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              Lab
            </button>
          </div>
        </div>

        {/* Members Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTeam}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className={`grid gap-4 ${team.length <= 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3 lg:grid-cols-5"}`}
          >
            {team.map((member, i) => (
              <motion.div
                key={member.regNo}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-5 text-center hover:border-primary/30 transition-colors`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-display font-semibold text-sm text-foreground leading-tight">{member.name}</h4>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">{member.regNo}</p>
                <span className="inline-block mt-2.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {member.role}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TeamCredits;
