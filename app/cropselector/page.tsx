import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Wheat, Ruler } from "lucide-react";
import { Calendar } from "@/app/components/ui/calendar";

interface CropInput {
  cropType: string;
  landSize: number;
  landUnit: "acres" | "hectares" | "bigha";
  sowingDate?: Date;
}
interface CropSelectorProps {
  cropInput: CropInput;
  onCropInputChange: (input: CropInput) => void;
}
export default function CropSelector({
  cropInput = {
    cropType: "",
    landSize: 0,
    landUnit: "acres",
    sowingDate: undefined,
  },
  onCropInputChange,
}: CropSelectorProps) {
  const CROP_TYPES = [
    { name: "Apple", icon: "🍎", season: "Winter" },
    { name: "Blueberry", icon: "🫐", season: "Spring/Summer" },
    { name: "Banana", icon: "🍌", season: "Annual" },
    { name: "Cherry", icon: "🍒", season: "Spring" },
    { name: "Chilli", icon: "🌶️", season: "Kharif/Rabi" },
    { name: "Chickpea", icon: "🫘", season: "Rabi" },
    { name: "Coconut", icon: "🥥", season: "Annual" },
    { name: "Ginger", icon: "🫚", season: "Kharif" },
    { name: "Grapes", icon: "🍇", season: "Winter" },
    { name: "Groundnut", icon: "🥜", season: "Kharif/Rabi" },
    { name: "Mustard", icon: "🌻", season: "Rabi" },
    { name: "Maize", icon: "🌽", season: "Kharif/Rabi" },
    { name: "Millet", icon: "🌾", season: "Kharif" },
    { name: "Mango", icon: "🥭", season: "Summer" },
    { name: "Orange", icon: "🍊", season: "Winter" },
    { name: "Onion", icon: "🧅", season: "Rabi" },
    { name: "Potato", icon: "🥔", season: "Rabi" },
    { name: "Pigeon Pea", icon: "🫛", season: "Kharif" },
    { name: "Rice", icon: "🌾", season: "Kharif" },
    { name: "Sugarcane", icon: "🎋", season: "Annual" },
    { name: "Sunflower", icon: "🌻", season: "Kharif/Rabi" },
    { name: "Strawberry", icon: "🍓", season: "Rabi/Kharif" },
    { name: "Soybean", icon: "🫘", season: "Kharif" },
    { name: "Sorghum", icon: "🌾", season: "Kharif/Rabi" },
    { name: "Tomato", icon: "🍅", season: "Rabi/Kharif" },
    { name: "Turmeric", icon: "🟡", season: "Kharif" },
    { name: "Wheat", icon: "🌾", season: "Rabi" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-[#E5EFE4] flex items-center justify-center">
          <Wheat className="w-5 h-5 text-[#248F24]" />
        </div>
        <div>
          <h3 className="font-display font-bold text-black">
            Crop Information
          </h3>
          <p className="text-sm text-green-800">
            Select crop type and land size
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-80 ">
        {/* LEFT SIDE – Crop inputs */}
        <div className="space-y-4">
          {/* Crop Type */}
          <div className="space-y-2">
            <Label htmlFor="cropType" className="text-sm font-medium">
              Crop Type
            </Label>
            <Select
              value={cropInput?.cropType || ""}
              onValueChange={(value) =>
                onCropInputChange({ ...cropInput, cropType: value })
              }
            >
              <SelectTrigger id="cropType">
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent className="bg-popover max-h-60">
                {CROP_TYPES.map((crop) => (
                  <SelectItem key={crop.name} value={crop.name}>
                    <div className="flex items-center gap-2">
                      <span>{crop.icon}</span>
                      <span>{crop.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({crop.season})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Land Size */}
          <div className="space-y-2">
            <Label htmlFor="landSize" className="text-sm font-medium">
              Land Size
            </Label>
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="landSize"
                type="number"
                placeholder="Enter size"
                value={cropInput?.landSize || ""}
                onChange={(e) =>
                  onCropInputChange({
                    ...cropInput,
                    landSize: parseFloat(e.target.value) || 0,
                  })
                }
                className="pl-10 bg-[#F8F8F2]"
                min={0}
                step={0.1}
              />
            </div>
          </div>

          {/* Land Unit */}
          <div className="space-y-2">
            <Label htmlFor="landUnit" className="text-sm font-medium">
              Unit
            </Label>
            <Select
              value={cropInput?.landUnit || "acres"}
              onValueChange={(value: "acres" | "hectares" | "bigha") =>
                onCropInputChange({ ...cropInput, landUnit: value })
              }
            >
              <SelectTrigger id="landUnit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="acres">Acres</SelectItem>
                <SelectItem value="hectares">Hectares</SelectItem>
                <SelectItem value="bigha">Bigha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* RIGHT SIDE – Sowing Date */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sowing Date (optional)</Label>

          <div className="rounded-xl border bg-background p-2">
            <Calendar
              mode="single"
              selected={cropInput?.sowingDate}
              onSelect={(date) =>
                onCropInputChange({ ...cropInput, sowingDate: date })
              }
              disabled={(date) => date > new Date()}
            />
          </div>

          <p className="text-xs text-green-800">
            Used for crop growth stage, NDVI timeline & yield prediction
          </p>
        </div>
      </div>

      {/* Selected Crop Preview */}
      {cropInput.cropType && (
        <div className="p-4 rounded-xl bg-leaf/5 border border-leaf/20">
          <div className="flex items-center gap-3">
            <div className="text-4xl">
              {CROP_TYPES.find((c) => c.name === cropInput.cropType)?.icon}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                {cropInput.cropType}
              </h4>
              <p className="text-sm text-muted-foreground">
                Season:{" "}
                {CROP_TYPES.find((c) => c.name === cropInput.cropType)?.season}
                {cropInput.landSize > 0 && (
                  <span>
                    {" "}
                    • {cropInput.landSize} {cropInput.landUnit}
                  </span>
                )}
              </p>
              {cropInput.sowingDate && (
                <p className="text-sm text-muted-foreground">
                  Sown on: {cropInput.sowingDate.toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
