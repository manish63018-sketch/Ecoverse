/**
 * "Supabase is the only source of truth for authentication and app data."
 */

export interface RoleDetails {
  id: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
  responsibilities: string[];
  skills_required: string;
  badge_earned: string;
  sos_access?: boolean;
  map_visible?: boolean;
  special_access?: string[];
  vehicle_info_required?: boolean;
}

export const ECOVERSE_ROLES: Record<string, RoleDetails> = {
  rescuer: {
    id: 'rescuer',
    label: 'Animal Rescuer',
    emoji: '🐾',
    color: '#66BB6A',
    description: 'Physically rescue injured or abandoned animals. First responder on the ground.',
    responsibilities: [
      'Respond to SOS alerts within your area',
      'Physically reach the animal and provide immediate help',
      'Document the case with photos and condition notes',
      'Transport to vet or hand off to transport volunteer',
    ],
    skills_required: 'Basic animal handling, calm under pressure',
    badge_earned: 'First Responder',
    sos_access: true,
    map_visible: true,
  },

  medical_care: {
    id: 'medical_care',
    label: 'Medical Care Volunteer',
    emoji: '🏥',
    color: '#42a5f5',
    description: 'Provide or arrange veterinary care. Ideal for vets, vet students, and trained animal first-aiders.',
    responsibilities: [
      'Assess animal medical condition remotely or on-site',
      'Advise rescuers on immediate first aid steps',
      'Coordinate with vet clinics for emergency treatment',
      'Maintain vaccination and treatment records in EcoVerse',
      'Guide post-rescue care for fosters and adopters',
    ],
    skills_required: 'Veterinary background, animal first aid knowledge',
    badge_earned: 'Animal Medic',
    sos_access: true,
    special_access: ['medical_notes_edit', 'vet_directory'],
    map_visible: true,
  },

  transport: {
    id: 'transport',
    label: 'Transport Volunteer',
    emoji: '🚗',
    color: '#ff9800',
    description: 'Move injured animals from rescue point to vet clinic, shelter, or foster home. Vehicle required.',
    responsibilities: [
      'Accept transport requests from rescuers nearby',
      'Provide safe, clean vehicle for animal transport',
      'Follow vet/rescuer instructions during transit',
      'Update case status on arrival',
      'Know nearest emergency vets in your city',
    ],
    skills_required: 'Own vehicle (2-wheeler or 4-wheeler), city knowledge',
    badge_earned: 'Road Angel',
    sos_access: true,
    special_access: ['transport_requests'],
    map_visible: true,
    vehicle_info_required: true,
  },

  foster: {
    id: 'foster',
    label: 'Foster Parent',
    emoji: '🏠',
    color: '#ab47bc',
    description: 'Temporarily house animals during recovery or while finding a permanent home.',
    responsibilities: [
      'Provide safe, clean temporary home',
      'Follow medical care instructions',
      'Update animal progress weekly on EcoVerse',
      'Help socialize animals for adoption readiness',
    ],
    skills_required: 'Safe home, no aggressive pets, basic animal care',
    badge_earned: 'Safe Harbor',
    special_access: ['foster_listings'],
  },

  adopter: {
    id: 'adopter',
    label: 'Adopter',
    emoji: '💚',
    color: '#66BB6A',
    description: 'Give a rescued animal a permanent loving home.',
    responsibilities: [
      'Complete adoption application honestly',
      'Provide safe home environment',
      'Maintain vaccination schedule',
      'Send monthly update to EcoVerse for 3 months',
    ],
    skills_required: 'Stable housing, commitment to animal care',
    badge_earned: 'Forever Home',
  },

  street_feeder: {
    id: 'street_feeder',
    label: 'Street Feeder / Caretaker',
    emoji: '🍱',
    color: '#ffd54f',
    description: 'Daily feeding and monitoring of street animals in your neighborhood.',
    responsibilities: [
      'Feed registered colony animals daily',
      'Report new injured or sick animals immediately',
      'Track animal count and health in your zone',
      'Coordinate with NGOs for TNR programs',
    ],
    skills_required: 'Consistency, neighborhood knowledge',
    badge_earned: 'Colony Guardian',
    special_access: ['feeding_logs'],
  },

  ngo_staff: {
    id: 'ngo_staff',
    label: 'NGO Staff / Coordinator',
    emoji: '🏢',
    color: '#26c6da',
    description: 'Manage rescue operations, volunteers, and resources for a registered NGO.',
    responsibilities: [
      'Accept escalated rescue cases from EcoVerse SOS',
      'Dispatch NGO volunteers and vehicles',
      'Manage shelter capacity and intake records',
      'Post adoption listings from shelter animals',
      'File incident reports for cruelty cases',
    ],
    skills_required: 'NGO registration, team coordination',
    badge_earned: 'Organization Hero',
    special_access: ['ngo_dashboard', 'escalation_receive', 'shelter_management'],
  },

  vegan_advocate: {
    id: 'vegan_advocate',
    label: 'Vegan Advocate',
    emoji: '🌱',
    color: '#a5d6a7',
    description: 'Promote plant-based living and animal rights through the EcoVerse community.',
    responsibilities: [
      'Share vegan recipes, tips, and resources',
      'Mentor vegan-curious community members',
      'Organize local vegan meetups (list on EcoVerse)',
      'Respond to questions in Vegan section',
    ],
    skills_required: 'Vegan lifestyle, patience, empathy',
    badge_earned: 'Green Heart',
  },

  volunteer: {
    id: 'volunteer',
    label: 'General Volunteer',
    emoji: '🤝',
    color: '#b0bec5',
    description: 'Support wherever needed — events, awareness, admin, social media.',
    responsibilities: [
      'Help with EcoVerse campaigns and awareness drives',
      'Support rescuers and NGOs with non-medical tasks',
      'Share EcoVerse with your network',
    ],
    skills_required: 'Willingness to help, any skill welcome',
    badge_earned: 'Community Pillar',
  },
};
