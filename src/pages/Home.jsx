import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Upload, Users, Shield, Sparkles, Zap, Heart } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-glow/60"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 animate-slide-up">
            StudyShare
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
            The ultimate platform for students to share, discover, and collaborate on educational resources
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{animationDelay: '0.4s'}}>
            <Link to="/register">
              <Button size="xl" variant="glow" className="w-full sm:w-auto">
                <Users className="w-5 h-5" />
                Join as Student
              </Button>
            </Link>
            <Link to="/login">
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                <Shield className="w-5 h-5" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 float">
          <div className="w-16 h-16 bg-white/20 rounded-xl backdrop-blur-sm"></div>
        </div>
        <div className="absolute top-40 right-20 float" style={{animationDelay: '1s'}}>
          <div className="w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm"></div>
        </div>
        <div className="absolute bottom-40 left-20 float" style={{animationDelay: '2s'}}>
          <div className="w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Everything you need to excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From sharing notes to collaborative projects, StudyShare empowers students with the tools they need to succeed together.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-floating group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Easy Uploads</h3>
                <p className="text-muted-foreground">
                  Share your notes, assignments, and projects with just a few clicks. Our intuitive interface makes uploading effortless.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-floating group" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Smart Discovery</h3>
                <p className="text-muted-foreground">
                  Find exactly what you need with our powerful search and filtering system. Browse by subject, type, or popularity.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-floating group" style={{animationDelay: '0.4s'}}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Quality Control</h3>
                <p className="text-muted-foreground">
                  All content is reviewed by our admin team to ensure high quality and relevance for your academic success.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-muted-foreground">Resources Shared</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">5K+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">50+</div>
              <div className="text-muted-foreground">Subjects Covered</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">99%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to start sharing?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students who are already collaborating and succeeding together.
          </p>
          <Link to="/register">
            <Button size="xl" variant="glow" className="animate-bounce-subtle">
              <Sparkles className="w-5 h-5" />
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <span className="text-lg">Made with love for students</span>
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <p className="text-muted-foreground">
            © 2024 StudyShare. Empowering education through collaboration.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;