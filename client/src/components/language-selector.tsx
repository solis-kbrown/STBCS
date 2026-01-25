import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n/context";
import type { LanguageCode } from "@/lib/i18n/translations";

export function LanguageSelector() {
  const { language, setLanguage, languages, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 gap-2 text-muted-foreground hover:text-white"
          data-testid="button-language-selector"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languages[language].flag} {languages[language].nativeName}</span>
          <span className="sm:hidden">{languages[language].flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto">
        {(Object.keys(languages) as LanguageCode[]).map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code)}
            className={`cursor-pointer ${language === code ? 'bg-primary/10 text-primary' : ''}`}
            data-testid={`menu-item-language-${code}`}
          >
            <span className="mr-2">{languages[code].flag}</span>
            <span className="flex-1">{languages[code].nativeName}</span>
            {language === code && (
              <span className="text-primary text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
