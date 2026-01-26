<template>
 <div class="font-sans antialiased bg-white">
  <!-- Navigation -->
  <nav
   class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100"
  >
   <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
     <div class="flex items-center space-x-2">
      <div class="p-2 bg-blue-600 rounded-lg">
       <Store class="w-5 h-5 text-white" />
      </div>
      <span class="text-xl font-bold text-slate-900">Retail CTRL</span>
     </div>
     <div class="hidden md:flex items-center space-x-8">
      <a
       href="#services"
       class="text-slate-600 hover:text-slate-900 transition-colors"
       >Services</a
      >
      <a
       href="#how-it-works"
       class="text-slate-600 hover:text-slate-900 transition-colors"
       >How It Works</a
      >
      <a
       href="#benefits"
       class="text-slate-600 hover:text-slate-900 transition-colors"
       >Benefits</a
      >
     </div>
     <div class="flex items-center space-x-4">
      <Button
       v-if="isAuthenticated"
       variant="outline"
       class="border-slate-300 text-slate-700 hover:bg-slate-50"
       @click="handleViewDashboard"
      >
       Go to Dashboard
       <ArrowRight class="ml-2 w-4 h-4" />
      </Button>
      <template v-else>
       <Button
        variant="ghost"
        class="text-slate-600 hover:text-slate-900"
        @click="handleLogin"
       >
        Sign In
       </Button>
       <Button
        class="bg-blue-600 hover:bg-blue-700 text-white"
        @click="handleGetStarted"
       >
        Get Started
       </Button>
      </template>
     </div>
    </div>
   </div>
  </nav>

  <main>
   <!-- Hero Section -->
   <section
    id="hero"
    class="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50"
   >
    <!-- Subtle geometric pattern -->
    <div class="absolute inset-0 bg-grid-pattern opacity-40"></div>

    <!-- Floating shapes -->
    <div
     class="absolute top-32 left-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-60 animate-float"
    ></div>
    <div
     class="absolute bottom-20 right-10 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-50 animate-float-delayed"
    ></div>

    <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
     <div class="max-w-4xl mx-auto text-center space-y-8">
      <Badge
       variant="outline"
       class="border-blue-200 text-blue-600 bg-blue-50/50"
      >
       <Sparkles class="w-3 h-3 mr-1" />
       Technology + Expertise for Smarter Retail
      </Badge>

      <h1
       class="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight"
      >
       Take Control of Your
       <span
        class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500"
       >
        Retail Operations
       </span>
      </h1>

      <p class="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
       We help retail businesses reduce costs, automate processes, and gain
       complete visibility through our powerful platform and expert consulting
       services.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
       <Button
        size="lg"
        class="bg-blue-600 hover:bg-blue-700 text-white group rounded-xl px-8"
        @click="scrollToSection('services')"
       >
        Explore Platform
        <ArrowRight
         class="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
        />
       </Button>

       <Button
        size="lg"
        variant="outline"
        class="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl px-8"
        @click="scrollToSection('cta')"
       >
        <MessageCircle class="mr-2 w-4 h-4" />
        Talk to an Expert
       </Button>
      </div>

      <!-- Trust indicators -->
      <div
       class="pt-12 flex flex-wrap justify-center gap-8 text-slate-500 text-sm"
      >
       <div class="flex items-center gap-2">
        <CheckCircle2 class="w-5 h-5 text-green-500" />
        <span>No setup fees</span>
       </div>
       <div class="flex items-center gap-2">
        <CheckCircle2 class="w-5 h-5 text-green-500" />
        <span>14-day free trial</span>
       </div>
       <div class="flex items-center gap-2">
        <CheckCircle2 class="w-5 h-5 text-green-500" />
        <span>Cancel anytime</span>
       </div>
      </div>
     </div>
    </div>

    <!-- Scroll indicator -->
    <div
     class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
    >
     <ChevronDown class="w-6 h-6 text-slate-400" />
    </div>
   </section>

   <!-- Problem/Solution Section -->
   <section id="problem" class="py-24 bg-slate-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
     <div class="max-w-3xl mx-auto text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
       Running a Retail Business Shouldn't Be This Hard
      </h2>
      <p class="text-lg text-slate-600">
       We understand the challenges you face every day
      </p>
     </div>

     <div class="grid md:grid-cols-3 gap-8 mb-16">
      <Card
       v-for="problem in problems"
       :key="problem.title"
       class="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
      >
       <CardContent class="p-6">
        <div
         class="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4"
        >
         <component :is="problem.icon" class="w-6 h-6 text-red-500" />
        </div>
        <h3 class="text-lg font-semibold text-slate-900 mb-2">
         {{ problem.title }}
        </h3>
        <p class="text-slate-600">{{ problem.description }}</p>
       </CardContent>
      </Card>
     </div>

     <div class="text-center">
      <div
       class="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl"
      >
       <Lightbulb class="w-6 h-6" />
       <span class="text-lg font-medium"
        >Retail CTRL is your unified solution for operations excellence</span
       >
      </div>
     </div>
    </div>
   </section>

   <!-- Services Section -->
   <section id="services" class="py-24 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
     <div class="max-w-3xl mx-auto text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
       Everything You Need to Succeed
      </h2>
      <p class="text-lg text-slate-600">
       A powerful platform combined with expert consulting services
      </p>
     </div>

     <!-- Platform Features -->
     <div class="mb-20">
      <div class="flex items-center gap-3 mb-8">
       <div class="p-2 bg-blue-100 rounded-lg">
        <Monitor class="w-5 h-5 text-blue-600" />
       </div>
       <h3 class="text-2xl font-bold text-slate-900">Platform Features</h3>
       <Badge class="bg-blue-100 text-blue-700">The App</Badge>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
       <Card
        v-for="feature in platformFeatures"
        :key="feature.title"
        class="border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300 group"
       >
        <CardContent class="p-6">
         <div
          class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors"
         >
          <component
           :is="feature.icon"
           class="w-6 h-6 text-blue-600 group-hover:text-white transition-colors"
          />
         </div>
         <h4 class="text-lg font-semibold text-slate-900 mb-2">
          {{ feature.title }}
         </h4>
         <p class="text-slate-600 text-sm mb-3">{{ feature.description }}</p>
         <p class="text-blue-600 text-sm font-medium">{{ feature.benefit }}</p>
        </CardContent>
       </Card>
      </div>
     </div>

     <!-- Consulting Services -->
     <div>
      <div class="flex items-center gap-3 mb-8">
       <div class="p-2 bg-teal-100 rounded-lg">
        <Users class="w-5 h-5 text-teal-600" />
       </div>
       <h3 class="text-2xl font-bold text-slate-900">Consulting Services</h3>
       <Badge class="bg-teal-100 text-teal-700">Expert Services</Badge>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
       <Card
        v-for="service in consultingServices"
        :key="service.title"
        class="border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300 group"
       >
        <CardContent class="p-6">
         <div
          class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-600 transition-colors"
         >
          <component
           :is="service.icon"
           class="w-6 h-6 text-teal-600 group-hover:text-white transition-colors"
          />
         </div>
         <h4 class="text-lg font-semibold text-slate-900 mb-2">
          {{ service.title }}
         </h4>
         <p class="text-slate-600 text-sm mb-3">{{ service.description }}</p>
         <p class="text-teal-600 text-sm font-medium">{{ service.benefit }}</p>
        </CardContent>
       </Card>
      </div>
     </div>
    </div>
   </section>

   <!-- How It Works Section -->
   <section id="how-it-works" class="py-24 bg-slate-900">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
     <div class="max-w-3xl mx-auto text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
       How It Works
      </h2>
      <p class="text-lg text-slate-400">
       A simple process to transform your operations
      </p>
     </div>

     <div class="grid md:grid-cols-4 gap-8">
      <div v-for="(step, index) in steps" :key="step.title" class="relative">
       <div class="text-center">
        <div
         class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 relative"
        >
         <component :is="step.icon" class="w-8 h-8 text-white" />
         <div
          class="absolute -top-2 -right-2 w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm"
         >
          {{ index + 1 }}
         </div>
        </div>
        <h3 class="text-xl font-semibold text-white mb-2">{{ step.title }}</h3>
        <p class="text-slate-400">{{ step.description }}</p>
       </div>
       <!-- Connector line -->
       <div
        v-if="index < steps.length - 1"
        class="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-600 to-teal-400"
       ></div>
      </div>
     </div>
    </div>
   </section>

   <!-- Benefits Section -->
   <section id="benefits" class="py-24 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
     <div class="max-w-3xl mx-auto text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
       Real Results for Real Businesses
      </h2>
      <p class="text-lg text-slate-600">
       See the impact Retail CTRL can have on your operations
      </p>
     </div>

     <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div v-for="benefit in benefits" :key="benefit.title" class="text-center">
       <div class="text-5xl font-bold text-blue-600 mb-2">
        {{ benefit.value }}
       </div>
       <div class="text-lg font-semibold text-slate-900 mb-1">
        {{ benefit.title }}
       </div>
       <div class="text-slate-600 text-sm">{{ benefit.description }}</div>
      </div>
     </div>
    </div>
   </section>

   <!-- Testimonials Section -->
   <section id="testimonials" class="py-24 bg-slate-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
     <div class="max-w-3xl mx-auto text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
       Trusted by Retail Businesses
      </h2>
      <p class="text-lg text-slate-600">See what our clients have to say</p>
     </div>

     <div class="grid md:grid-cols-3 gap-8 mb-16">
      <Card
       v-for="testimonial in testimonials"
       :key="testimonial.name"
       class="border-slate-200 bg-white"
      >
       <CardContent class="p-6">
        <div class="flex gap-1 mb-4">
         <Star
          v-for="i in 5"
          :key="i"
          class="w-5 h-5 text-yellow-400 fill-yellow-400"
         />
        </div>
        <p class="text-slate-600 mb-6 italic">"{{ testimonial.quote }}"</p>
        <div class="flex items-center gap-3">
         <div
          class="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center"
         >
          <User class="w-5 h-5 text-slate-500" />
         </div>
         <div>
          <div class="font-semibold text-slate-900">{{ testimonial.name }}</div>
          <div class="text-sm text-slate-500">{{ testimonial.role }}</div>
         </div>
        </div>
       </CardContent>
      </Card>
     </div>

     <!-- Client logos placeholder -->
     <div class="text-center">
      <p class="text-slate-500 mb-6">Trusted by 50+ retail businesses</p>
      <div class="flex flex-wrap justify-center gap-8">
       <div
        v-for="i in 5"
        :key="i"
        class="w-32 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm"
       >
        Logo {{ i }}
       </div>
      </div>
     </div>
    </div>
   </section>

   <!-- CTA Section -->
   <section id="cta" class="py-24 bg-gradient-to-br from-blue-600 to-blue-700">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
     <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
       Ready to Take Control of Your Retail Operations?
      </h2>
      <p class="text-xl text-blue-100 mb-8">
       Join retail businesses that have transformed their operations with Retail
       CTRL
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
       <Button
        size="lg"
        class="bg-white text-blue-600 hover:bg-blue-50 rounded-xl px-8"
        @click="handleGetStarted"
       >
        Start Free Trial
        <ArrowRight class="ml-2 w-4 h-4" />
       </Button>
       <Button
        size="lg"
        variant="outline"
        class="border-white/30 text-white hover:bg-white/10 rounded-xl px-8"
        @click="scrollToSection('services')"
       >
        Schedule a Demo
       </Button>
      </div>

      <p class="text-blue-200 text-sm mt-6">
       No credit card required. 14-day free trial.
      </p>
     </div>
    </div>
   </section>
  </main>

  <!-- Footer -->
  <footer class="bg-slate-900 py-16">
   <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid md:grid-cols-4 gap-12 mb-12">
     <!-- Company info -->
     <div class="space-y-4">
      <div class="flex items-center space-x-2">
       <div class="p-2 bg-blue-600 rounded-lg">
        <Store class="w-5 h-5 text-white" />
       </div>
       <span class="text-xl font-bold text-white">Retail CTRL</span>
      </div>
      <p class="text-slate-400 text-sm">
       Technology + Expertise for Smarter Retail Operations
      </p>
      <div class="flex gap-4">
       <a
        href="#"
        class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
       >
        <Linkedin class="w-5 h-5" />
       </a>
       <a
        href="#"
        class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
       >
        <Twitter class="w-5 h-5" />
       </a>
       <a
        href="#"
        class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
       >
        <Facebook class="w-5 h-5" />
       </a>
      </div>
     </div>

     <!-- Quick links -->
     <div>
      <h4 class="text-white font-semibold mb-4">Platform</h4>
      <ul class="space-y-2">
       <li>
        <a
         href="#"
         class="text-slate-400 hover:text-white transition-colors text-sm"
         >OCR Invoice Processing</a
        >
       </li>
       <li>
        <a
         href="#"
         class="text-slate-400 hover:text-white transition-colors text-sm"
         >Task Management</a
        >
       </li>
       <li>
        <a
         href="#"
         class="text-slate-400 hover:text-white transition-colors text-sm"
         >Rota Scheduler</a
        >
       </li>
       <li>
        <a
         href="#"
         class="text-slate-400 hover:text-white transition-colors text-sm"
         >Dashboard</a
        >
       </li>
      </ul>
     </div>

     <!-- Services -->
     <div>
      <h4 class="text-white font-semibold mb-4">Services</h4>
      <ul class="space-y-2">
       <li>
        <a
         href="#"
         class="text-slate-400 hover:text-white transition-colors text-sm"
         >Data Analysis</a
        >
       </li>
       <li>
        <a
         href="#"
         class="text-slate-400 hover:text-white transition-colors text-sm"
         >Cost Reduction</a
        >
       </li>
       <li>
        <a
         href="#"
         class="text-slate-400 hover:text-white transition-colors text-sm"
         >Business Automation</a
        >
       </li>
       <li>
        <a
         href="#"
         class="text-slate-400 hover:text-white transition-colors text-sm"
         >Consulting</a
        >
       </li>
      </ul>
     </div>

     <!-- Contact -->
     <div>
      <h4 class="text-white font-semibold mb-4">Contact</h4>
      <ul class="space-y-2">
       <li class="flex items-center gap-2 text-slate-400 text-sm">
        <Mail class="w-4 h-4" />
        <span>hello@retailctrl.com</span>
       </li>
       <li class="flex items-center gap-2 text-slate-400 text-sm">
        <Phone class="w-4 h-4" />
        <span>+44 20 1234 5678</span>
       </li>
       <li class="flex items-center gap-2 text-slate-400 text-sm">
        <MapPin class="w-4 h-4" />
        <span>London, United Kingdom</span>
       </li>
      </ul>
     </div>
    </div>

    <div
     class="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
    >
     <p class="text-slate-500 text-sm">
      &copy; {{ new Date().getFullYear() }} Retail CTRL. All rights reserved.
     </p>
     <div class="flex gap-6">
      <a
       href="#"
       class="text-slate-500 hover:text-white transition-colors text-sm"
       >Privacy Policy</a
      >
      <a
       href="#"
       class="text-slate-500 hover:text-white transition-colors text-sm"
       >Terms of Service</a
      >
     </div>
    </div>
   </div>
  </footer>
 </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
 ArrowRight,
 Store,
 Sparkles,
 CheckCircle2,
 ChevronDown,
 MessageCircle,
 Clock,
 Eye,
 FileSpreadsheet,
 Lightbulb,
 Monitor,
 Users,
 ScanLine,
 ListTodo,
 CalendarClock,
 LayoutDashboard,
 BarChart3,
 PiggyBank,
 Cog,
 GraduationCap,
 Search,
 Settings,
 TrendingUp,
 Rocket,
 Star,
 User,
 Linkedin,
 Twitter,
 Facebook,
 Mail,
 Phone,
 MapPin,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

// Problem section data
const problems = [
 {
  icon: Clock,
  title: 'Manual Processes',
  description:
   'Hours wasted on data entry, paperwork, and repetitive tasks that could be automated.',
 },
 {
  icon: Eye,
  title: 'Lack of Visibility',
  description:
   "No clear view of costs, performance, or what's happening across your stores.",
 },
 {
  icon: FileSpreadsheet,
  title: 'Disconnected Tools',
  description:
   "Spreadsheets, paper notes, and multiple systems that don't talk to each other.",
 },
]

// Platform features data
const platformFeatures = [
 {
  icon: ScanLine,
  title: 'OCR Invoice Processing',
  description: 'Automatic invoice scanning and data extraction.',
  benefit: 'Turn paper into digital data in seconds',
 },
 {
  icon: ListTodo,
  title: 'Task Management',
  description: 'Assign and track tasks across teams.',
  benefit: 'Never lose track of what needs doing',
 },
 {
  icon: CalendarClock,
  title: 'Rota Scheduler',
  description: 'Employee shift scheduling made easy.',
  benefit: 'Schedule smarter, staff better',
 },
 {
  icon: LayoutDashboard,
  title: 'Operational Dashboard',
  description: 'Real-time visibility into store operations.',
  benefit: 'Track KPIs and performance at a glance',
 },
]

// Consulting services data
const consultingServices = [
 {
  icon: BarChart3,
  title: 'Data Analysis',
  description: 'Deep dive into your business data.',
  benefit: 'Unlock insights hidden in your numbers',
 },
 {
  icon: PiggyBank,
  title: 'Cost Reduction',
  description: 'Identify savings opportunities across operations.',
  benefit: "Find savings you didn't know existed",
 },
 {
  icon: Cog,
  title: 'Business Automation',
  description: 'Process mapping and automation strategy.',
  benefit: 'Work smarter, not harder',
 },
 {
  icon: GraduationCap,
  title: 'Operational Consulting',
  description: 'Best practices and staff training.',
  benefit: 'Expert guidance for your team',
 },
]

// How it works steps
const steps = [
 {
  icon: Search,
  title: 'Discover',
  description: 'We analyze your current operations and identify opportunities.',
 },
 {
  icon: Settings,
  title: 'Implement',
  description: 'Deploy the platform and customize it to your needs.',
 },
 {
  icon: TrendingUp,
  title: 'Optimize',
  description: 'Ongoing consulting to maximize your results.',
 },
 {
  icon: Rocket,
  title: 'Scale',
  description: 'Grow with confidence and complete control.',
 },
]

// Benefits data
const benefits = [
 {
  value: '75%',
  title: 'Faster Processing',
  description: 'Reduce invoice processing time',
 },
 {
  value: '30%',
  title: 'Cost Savings',
  description: 'Cut operational costs',
 },
 {
  value: '2x',
  title: 'Productivity',
  description: 'Improve team efficiency',
 },
 {
  value: '100%',
  title: 'Visibility',
  description: 'Complete operational oversight',
 },
]

// Testimonials data
const testimonials = [
 {
  name: 'Sarah Mitchell',
  role: 'Operations Manager, Fresh Foods Co.',
  quote:
   'Retail CTRL transformed how we manage our stores. Invoice processing that took hours now takes minutes.',
 },
 {
  name: 'James Chen',
  role: 'Owner, Urban Style Boutiques',
  quote:
   'The consulting team helped us identify savings we never knew existed. Incredible ROI in just 3 months.',
 },
 {
  name: 'Emma Williams',
  role: 'Finance Director, QuickMart',
  quote:
   'Finally, a platform that gives us real visibility into our operations. The dashboard is a game-changer.',
 },
]

const handleGetStarted = () => {
 if (isAuthenticated.value) {
  router.push('/app')
 } else {
  router.push('/auth/login')
 }
}

const handleViewDashboard = () => {
 router.push('/app')
}

const handleLogin = () => {
 router.push('/auth/login')
}

const scrollToSection = (sectionId: string) => {
 const element = document.getElementById(sectionId)
 if (element) {
  element.scrollIntoView({ behavior: 'smooth' })
 }
}
</script>

<style scoped>
.bg-grid-pattern {
 background-image:
  linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px);
 background-size: 3rem 3rem;
}

@keyframes float {
 0%,
 100% {
  transform: translateY(0px);
 }
 50% {
  transform: translateY(-20px);
 }
}

@keyframes float-delayed {
 0%,
 100% {
  transform: translateY(0px);
 }
 50% {
  transform: translateY(-30px);
 }
}

.animate-float {
 animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
 animation: float-delayed 8s ease-in-out infinite;
 animation-delay: 1s;
}

html {
 scroll-behavior: smooth;
}
</style>
