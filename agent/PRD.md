# Project Requirements Document (PRD)

## Project Name
Purkha (Family Relationship Builder)

## Overview
Purkha is a web-based application designed to help users visually build and manage their family relationships. It focuses on an intuitive, node-based drag-and-drop interface where users can map out generations, add family members, and attach rich media (photos, videos, audio) to document their family history.

## Target Users
- Individuals interested in genealogy and tracking their ancestry.
- Families wanting a shared, visual representation of their family tree.
- Historians or researchers mapping out relationships.

## Core Features
1. **Visual Graph Interface:** Interactive family tree using drag-and-drop nodes (powered by React Flow).
2. **Node Management:** Add various relationship types to an existing person:
   - Parent (Father/Mother)
   - Spouse
   - Sibling
   - Child
3. **Person Metadata:**
   - Name and Gender (Male, Female, Other) with distinct visual styling.
   - Media attachments (Image, Video, Audio) directly on the person's node.
4. **Relationship Metadata:**
   - Track marriage dates on "bond" nodes between spouses.
5. **Interactive Actions:** Delete nodes, edit names, update genders, and remove media seamlessly from the toolbar.
