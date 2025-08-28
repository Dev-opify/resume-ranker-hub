import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  TrendingUp, 
  Search, 
  Filter, 
  Eye, 
  Github, 
  Linkedin, 
  FileText,
  LogOut,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Candidate {
  id: string;
  name: string;
  class: string;
  semester: string;
  github_link: string | null;
  linkedin_link: string | null;
  resume_url: string | null;
  ats_score: number | null;
  created_at: string;
}

interface Stats {
  totalCandidates: number;
  avgAtsScore: number;
  classStats: Record<string, { count: number; avgScore: number }>;
}

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCandidates: 0, avgAtsScore: 0, classStats: {} });
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm, classFilter, semesterFilter]);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCandidates(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch candidates data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Candidate[]) => {
    const totalCandidates = data.length;
    const scoresSum = data.filter(c => c.ats_score).reduce((sum, c) => sum + (c.ats_score || 0), 0);
    const scoredCandidates = data.filter(c => c.ats_score).length;
    const avgAtsScore = scoredCandidates > 0 ? Math.round(scoresSum / scoredCandidates) : 0;

    const classStats: Record<string, { count: number; avgScore: number }> = {};
    
    data.forEach(candidate => {
      if (!classStats[candidate.class]) {
        classStats[candidate.class] = { count: 0, avgScore: 0 };
      }
      classStats[candidate.class].count++;
    });

    Object.keys(classStats).forEach(className => {
      const classCandidates = data.filter(c => c.class === className && c.ats_score);
      const classScoresSum = classCandidates.reduce((sum, c) => sum + (c.ats_score || 0), 0);
      classStats[className].avgScore = classCandidates.length > 0 
        ? Math.round(classScoresSum / classCandidates.length) 
        : 0;
    });

    setStats({ totalCandidates, avgAtsScore, classStats });
  };

  const filterCandidates = () => {
    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (classFilter !== "all") {
      filtered = filtered.filter(candidate => candidate.class === classFilter);
    }

    if (semesterFilter !== "all") {
      filtered = filtered.filter(candidate => candidate.semester === semesterFilter);
    }

    setFilteredCandidates(filtered);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const openResumeInNewTab = (resumeUrl: string) => {
    const { data } = supabase.storage
      .from("resumes")
      .getPublicUrl(resumeUrl);
    
    window.open(data.publicUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage candidate applications and ATS scores</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover-lift slide-up">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            </CardContent>
          </Card>

          <Card className="hover-lift slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average ATS Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgAtsScore}%</div>
            </CardContent>
          </Card>

          <Card className="hover-lift slide-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.classStats).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Class Stats */}
        <Card className="mb-8 slide-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle>Class Performance</CardTitle>
            <CardDescription>Average ATS scores by academic level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(stats.classStats).map(([className, data]) => (
                <div key={className} className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-sm font-medium capitalize text-muted-foreground mb-1">
                    {className}
                  </div>
                  <div className="text-2xl font-bold">{data.avgScore}%</div>
                  <div className="text-xs text-muted-foreground">{data.count} candidates</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-6 slide-up" style={{ animationDelay: "0.4s" }}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="freshman">Freshman</SelectItem>
                    <SelectItem value="sophomore">Sophomore</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    <SelectItem value="fall">Fall</SelectItem>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidates Table */}
        <Card className="slide-up" style={{ animationDelay: "0.5s" }}>
          <CardHeader>
            <CardTitle>Candidates ({filteredCandidates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{candidate.name}</h3>
                      <Badge variant="secondary" className="capitalize">
                        {candidate.class}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {candidate.semester}
                      </Badge>
                      {candidate.ats_score && (
                        <Badge 
                          variant={candidate.ats_score >= 75 ? "default" : candidate.ats_score >= 50 ? "secondary" : "destructive"}
                        >
                          {candidate.ats_score}% ATS
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {candidate.github_link && (
                        <a 
                          href={candidate.github_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                        </a>
                      )}
                      {candidate.linkedin_link && (
                        <a 
                          href={candidate.linkedin_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </a>
                      )}
                      {candidate.resume_url && (
                        <button
                          onClick={() => openResumeInNewTab(candidate.resume_url!)}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Resume
                        </button>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCandidate(candidate)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Candidate Detail Dialog */}
        <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Candidate Details</DialogTitle>
            </DialogHeader>
            {selectedCandidate && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-lg font-semibold">{selectedCandidate.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ATS Score</label>
                    <p className="text-lg font-semibold">
                      {selectedCandidate.ats_score ? `${selectedCandidate.ats_score}%` : "Pending"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Class</label>
                    <p className="text-lg capitalize">{selectedCandidate.class}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Semester</label>
                    <p className="text-lg capitalize">{selectedCandidate.semester}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Links & Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.github_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedCandidate.github_link!, "_blank")}
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub Profile
                      </Button>
                    )}
                    {selectedCandidate.linkedin_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedCandidate.linkedin_link!, "_blank")}
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn Profile
                      </Button>
                    )}
                    {selectedCandidate.resume_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResumeInNewTab(selectedCandidate.resume_url!)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Resume
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Application Date</label>
                  <p className="text-sm">{new Date(selectedCandidate.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;