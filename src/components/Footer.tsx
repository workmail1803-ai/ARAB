"use client";

import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
    Product: [
        { label: "Features", href: "#" },
        { label: "Integrations", href: "#" },
        { label: "Pricing", href: "#" },
        { label: "API Docs", href: "#" },
    ],
    Solutions: [
        { label: "Food Delivery", href: "#" },
        { label: "Grocery", href: "#" },
        { label: "Pharmacy", href: "#" },
        { label: "Logistics", href: "#" },
    ],
    Company: [
        { label: "About Us", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Press", href: "#" },
    ],
    Support: [
        { label: "Help Center", href: "#" },
        { label: "Contact Us", href: "#" },
        { label: "Status", href: "#" },
        { label: "Terms of Service", href: "#" },
    ],
};

const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
];

export default function Footer() {
    return (
        <footer className="bg-[#1e293b] text-white">
            {/* CTA Section */}
            <div className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-gradient-to-r from-[#00BFA5] to-[#00A896] rounded-2xl p-8 lg:p-12 text-center">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                            Ready to streamline your deliveries?
                        </h2>
                        <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                            Join thousands of businesses that trust Tookan for their delivery
                            management needs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="#signup"
                                className="px-8 py-4 bg-white text-[#00BFA5] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Start Free Trial
                            </Link>
                            <Link
                                href="#demo"
                                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                            >
                                Request Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-[#00BFA5] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <span className="text-xl font-bold">Tookan</span>
                        </Link>
                        <p className="text-gray-400 mb-6 max-w-sm">
                            Enterprise Delivery Management System. Automate orders, dispatch,
                            tracking & marketing to scale your business.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Mail className="w-4 h-4" />
                                <span>support@tookan.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <Phone className="w-4 h-4" />
                                <span>+1 (800) 123-4567</span>
                            </div>
                            <div className="flex items-start gap-3 text-gray-400">
                                <MapPin className="w-4 h-4 mt-1" />
                                <span>Tampa, Florida, USA</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#00BFA5] transition-colors"
                                >
                                    <social.icon className="w-5 h-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="font-semibold mb-4">{title}</h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-400 hover:text-[#00BFA5] transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} Tookan. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
