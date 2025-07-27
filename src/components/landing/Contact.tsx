import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Clock, Award, Shield, Headphones } from 'lucide-react';
import SectionWrapper from '../shared/SectionWrapper';
import ContactForm from '../shared/ContactForm';
import { Button } from '../ui/button';
import { buttaBusinessInfo } from '../../data/businessInfo';

const Contact: React.FC = () => {
  const handlePhoneClick = () => {
    window.open(`tel:${buttaBusinessInfo.contact.phone}`, '_self');
  };

  const handleWhatsAppClick = () => {
    const message = "Hi! I'm interested in booking Butta Convention for my event. Please provide more details.";
    const whatsappUrl = `https://wa.me/918801886108?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailClick = () => {
    window.open(`mailto:${buttaBusinessInfo.contact.email}`, '_self');
  };

  const contactFeatures = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: '24/7 Support',
      description: 'Round-the-clock assistance for your event planning needs'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Expert Team',
      description: 'Experienced professionals dedicated to your success'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Trusted Service',
      description: 'Reliable and secure event management solutions'
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: 'Personal Consultation',
      description: 'One-on-one guidance for your perfect event'
    }
  ];

  return (
    <SectionWrapper id="contact" background="gradient" padding="xl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
            Get In Touch
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-amber-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Ready to plan your perfect event? Let's discuss your vision and make it a reality. Our team is here to help every step of the way.
          </p>
        </motion.div>

        {/* Contact Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {contactFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Contact Details Card */}
            <div className="bg-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Contact Information
              </h3>
              
              <div className="space-y-6">
                <motion.div 
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-green-50 transition-colors cursor-pointer"
                  onClick={handlePhoneClick}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-green-600 font-medium">{buttaBusinessInfo.contact.phone}</p>
                    <p className="text-sm text-gray-500">Click to call directly</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-green-50 transition-colors cursor-pointer"
                  onClick={handleEmailClick}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-green-600 font-medium">{buttaBusinessInfo.contact.email}</p>
                    <p className="text-sm text-gray-500">Send us an email</p>
                  </div>
                </motion.div>
                
                <div className="flex items-start space-x-4 p-4 rounded-xl">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-gray-700">{buttaBusinessInfo.contact.landmark}</p>
                    <p className="text-gray-600">{buttaBusinessInfo.contact.address}</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4 mt-8">
                <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handlePhoneClick} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </motion.div>
                <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleWhatsAppClick} variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="bg-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Find Us
              </h3>
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.6!2d78.3908!3d17.4485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDI2JzU0LjYiTiA3OMKwMjMnMjcuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Butta Convention Location"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Located in the heart of Madhapur, opposite Cyber Towers
              </p>
            </div>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div 
            className="bg-white p-8 rounded-3xl shadow-xl"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Send us a Message
            </h3>
            <p className="text-gray-600 mb-8">
              Fill out the form below and we'll get back to you within 24 hours with a personalized quote.
            </p>
            <ContactForm />
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Need Immediate Assistance?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Our event planning experts are available to discuss your requirements and provide instant quotes over the phone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handlePhoneClick}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 py-4 text-lg"
                >
                  <Phone className="w-5 h-5 mr-3" />
                  Call {buttaBusinessInfo.contact.phone}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleWhatsAppClick}
                  variant="outline"
                  size="lg"
                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 text-lg"
                >
                  <MessageCircle className="w-5 h-5 mr-3" />
                  WhatsApp Chat
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

export default Contact;