import { Clock, Sparkles, ThumbsUp, MapPin, Phone, Mail } from "lucide-react"
import { Button, Card } from 'flowbite-react'

export default function About() {
  return (
    <div className="flex flex-col min-h-screen dark:bg-gray-900">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-sky-50 to-white dark:from-sky-900 dark:to-gray-900">
        <div className="container px-4 md:px-6 text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold transition-all duration-300 hover:text-sky-600 dark:text-white dark:hover:text-sky-400">
            About SparkleWash Laundry
          </h1>
          <p className="text-gray-500 md:text-xl max-w-3xl mx-auto dark:text-gray-300">
            Your trusted partner for professional laundry services since 2010. We combine quality, convenience, and care in every wash.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 dark:bg-gray-800">
        <div className="container px-4 md:px-6 grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-sm font-medium dark:bg-sky-900/50 dark:text-sky-300">
              Our Story
            </span>
            <h2 className="text-3xl font-bold mt-4 dark:text-white">
              From a Small Shop to Your Neighborhood's Favorite
            </h2>
            <p className="text-gray-500 mt-4 dark:text-gray-300">
              SparkleWash began as a small family-owned laundromat in 2010...
            </p>
            <p className="text-gray-500 mt-2 dark:text-gray-300">
              Our founder, Sarah Johnson, recognized the need for quality service and customer satisfaction.
            </p>
          </div>
          <div className="relative group">
            <img
              src="/placeholder.svg"
              alt="Laundry storefront"
              className="rounded-xl object-cover w-full h-96 shadow-lg dark:border dark:border-gray-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sky-50/50 to-transparent rounded-xl dark:from-sky-900/50" />
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="bg-sky-50 py-16 dark:bg-sky-900/20">
        <div className="container px-4 md:px-6 text-center">
          <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-sm font-medium dark:bg-sky-900/50 dark:text-sky-300">
            Our Mission
          </span>
          <h2 className="text-3xl font-bold mt-4 dark:text-white">
            Making Laundry Day Your Favorite Day
          </h2>
          <p className="text-gray-500 md:text-xl max-w-3xl mx-auto mt-4 dark:text-gray-300">
            We believe clean clothes shouldn't come at the expense of your time or peace of mind.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {[
              {
                icon: <Clock className="h-8 w-8 text-sky-600 dark:text-sky-400" />,
                title: "Time-Saving",
                text: "We give you back your valuable time by handling your laundry efficiently.",
              },
              {
                icon: <Sparkles className="h-8 w-8 text-sky-600 dark:text-sky-400" />,
                title: "Quality Care",
                text: "Each garment receives personalized attention every time.",
              },
              {
                icon: <ThumbsUp className="h-8 w-8 text-sky-600 dark:text-sky-400" />,
                title: "Eco-Friendly",
                text: "We use environmentally responsible methods and products.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="text-center dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex flex-col items-center p-6 space-y-4">
                  <div className="rounded-full bg-sky-100 p-4 dark:bg-sky-900/50">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold dark:text-white">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-300">{feature.text}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 dark:bg-gray-900">
        <div className="container px-4 md:px-6 text-center">
          <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-sm font-medium dark:bg-sky-900/50 dark:text-sky-300">
            Our Team
          </span>
          <h2 className="text-3xl font-bold mt-4 dark:text-white">
            Meet the People Behind the Sparkle
          </h2>
          <p className="text-gray-500 md:text-xl max-w-3xl mx-auto mt-4 dark:text-gray-300">
            Our dedicated team provides you with the best laundry experience.
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {[
              { name: "Sarah Johnson", role: "Founder & CEO" },
              { name: "Michael Chen", role: "Operations Manager" },
              { name: "Elena Rodriguez", role: "Customer Service Lead" },
            ].map((member, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <img
                    src="/placeholder.svg"
                    alt={member.name}
                    className="rounded-full h-40 w-40 object-cover border-4 border-sky-100 dark:border-sky-900/50"
                  />
                </div>
                <h3 className="text-xl font-bold dark:text-white">{member.name}</h3>
                <p className="text-gray-500 dark:text-gray-300">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-sky-50 py-16 dark:bg-sky-900/20">
        <div className="container px-4 md:px-6 text-center">
          <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-sm font-medium dark:bg-sky-900/50 dark:text-sky-300">
            Testimonials
          </span>
          <h2 className="text-3xl font-bold mt-4 dark:text-white">
            What Our Customers Say
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {[
              {
                quote: "SparkleWash has been a lifesaver for our busy family.",
                author: "Jessica T.",
              },
              {
                quote: "Their attention to detail and consistent quality keeps me coming back.",
                author: "Robert M.",
              },
              {
                quote: "They offer hypoallergenic detergent options. No irritation at all!",
                author: "Aisha K.",
              },
            ].map((t, i) => (
              <Card key={i} className="dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-4">
                  <p className="italic text-gray-500 dark:text-gray-300">"{t.quote}"</p>
                  <p className="font-medium dark:text-white">— {t.author}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 dark:bg-gray-800">
        <div className="container px-4 md:px-6 grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-4">
            <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-sm font-medium dark:bg-sky-900/50 dark:text-sky-300">
              Contact Us
            </span>
            <h2 className="text-3xl font-bold dark:text-white">Get in Touch</h2>
            <p className="text-gray-500 dark:text-gray-300">
              Have questions or want to schedule a pickup? We're here to help!
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                <p className="text-gray-500 dark:text-gray-300">123 Clean Street, Laundryville</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                <p className="text-gray-500 dark:text-gray-300">(555) 123-4567</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                <p className="text-gray-500 dark:text-gray-300">info@sparklewash.example.com</p>
              </div>
            </div>
            <Button className="bg-sky-600 mt-4 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700">
              Schedule a Pickup
            </Button>
          </div>
          <img
            src="/placeholder.svg"
            alt="Laundry location"
            className="rounded-xl object-cover w-full h-96 shadow-lg dark:border dark:border-gray-700"
          />
        </div>
      </section>
    </div>
  )
}