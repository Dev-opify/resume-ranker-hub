// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 fade-in">
          <h1 className="text-6xl font-bold text-foreground mb-6">
            Welcome to <span className="gradient-primary bg-clip-text text-transparent">Devopify</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our platform to submit your application and get instant ATS scoring. 
            Connect with top opportunities and track your progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register" 
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary-hover transition-colors hover-lift"
            >
              Apply Now
            </a>
            <a 
              href="/admin/login" 
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors hover-lift"
            >
              Admin Login
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-6 rounded-xl bg-card border hover-lift slide-up">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Submit Application</h3>
            <p className="text-muted-foreground">
              Upload your resume and profile information to get started with the application process.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-card border hover-lift slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Get ATS Score</h3>
            <p className="text-muted-foreground">
              Receive instant feedback on your resume with our AI-powered ATS scoring system.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-card border hover-lift slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-muted-foreground">
              Monitor your application status and compare your performance with other candidates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
