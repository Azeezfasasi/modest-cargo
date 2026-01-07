import HomeAbout from "../models/HomeAbout";
import { connectDB } from "../../server/db/connect";
import mongoose from "mongoose";

// GET HomeAbout content
export async function getHomeAbout() {
  await connectDB();
  let homeAbout = await HomeAbout.findOne();
  
  // Initialize with default content if doesn't exist
  if (!homeAbout) {
    homeAbout = await HomeAbout.create({
      title: "About Modest Cargo",
      paragraphs: [
        {
          _id: new mongoose.Types.ObjectId(),
          text: "Modest Cargo is a dynamic, solutions-driven Engineering and Management Company committed to delivering world-class services across multiple sectors. Established in 2020 and legally incorporated in Nigeria in 2025 with a passion for innovation, engineering excellence, and sustainable project delivery.",
          order: 0,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          text: "We bring together nearly two decades of multidisciplinary experience spanning construction, telecommunications, optical fibre implementation, operations and maintenance, project management, corporate governance, and corporate social responsibility.",
          order: 1,
        }
      ],
      image: {
        url: "/images/telecom2.jpeg",
        alt: "Modest Cargo Team",
      },
      ctaButton: {
        label: "Learn More",
        href: "/about-us",
      },
    });
  }
  
  return homeAbout;
}

// UPDATE HomeAbout content
export async function updateHomeAbout(data) {
  await connectDB();
  
  let homeAbout = await HomeAbout.findOne();
  
  if (!homeAbout) {
    homeAbout = await HomeAbout.create(data);
  } else {
    homeAbout.title = data.title || homeAbout.title;
    homeAbout.image = data.image || homeAbout.image;
    homeAbout.ctaButton = data.ctaButton || homeAbout.ctaButton;
    homeAbout.updatedAt = new Date();
    
    if (data.paragraphs) {
      homeAbout.paragraphs = data.paragraphs;
    }
    
    await homeAbout.save();
  }
  
  return homeAbout;
}

// ADD paragraph
export async function addParagraph(paragraphText) {
  await connectDB();
  
  let homeAbout = await HomeAbout.findOne();
  
  if (!homeAbout) {
    homeAbout = await HomeAbout.create({ title: "About Us", paragraphs: [] });
  }
  
  const newParagraph = {
    _id: new mongoose.Types.ObjectId(),
    text: paragraphText,
    order: homeAbout.paragraphs.length,
  };
  
  homeAbout.paragraphs.push(newParagraph);
  homeAbout.updatedAt = new Date();
  await homeAbout.save();
  
  return newParagraph;
}

// UPDATE paragraph
export async function updateParagraph(paragraphId, paragraphText) {
  await connectDB();
  
  let homeAbout = await HomeAbout.findOne();
  
  if (!homeAbout) {
    throw new Error("Home About document not found");
  }
  
  const paragraph = homeAbout.paragraphs.find(
    (p) => p._id.toString() === paragraphId
  );
  
  if (!paragraph) {
    throw new Error("Paragraph not found");
  }
  
  paragraph.text = paragraphText;
  homeAbout.updatedAt = new Date();
  await homeAbout.save();
  
  return paragraph;
}

// DELETE paragraph
export async function deleteParagraph(paragraphId) {
  await connectDB();
  
  let homeAbout = await HomeAbout.findOne();
  
  if (!homeAbout) {
    throw new Error("Home About document not found");
  }
  
  homeAbout.paragraphs = homeAbout.paragraphs.filter(
    (p) => p._id.toString() !== paragraphId
  );
  
  // Reorder remaining paragraphs
  homeAbout.paragraphs.forEach((para, index) => {
    para.order = index;
  });
  
  homeAbout.updatedAt = new Date();
  await homeAbout.save();
  
  return { success: true, message: "Paragraph deleted successfully" };
}
