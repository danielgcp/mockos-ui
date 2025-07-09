import { DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { finalize, Subscription } from 'rxjs';
import { LIVE_MOCK_TEMPLATE } from '../../../../../../const/live-mock.const';
import { LIVE_MOCK_TYPE_DEFINITIONS } from '../../../../../../const/live-mock-types.const';
import { EditProcessorInterface } from '../../../../../../interfaces/edit-processor.interface';
import { ProcessorInterface } from '../../../../../../interfaces/processor.interface';
import { ResponsesService } from '../../../../../../services/responses/responses.service';
import { openToast } from '../../../../../../utils/toast.utils';

declare var monaco: any;

@Component({
  selector: 'app-live-mock',
  templateUrl: './live-mock.component.html',
  styleUrls: ['./live-mock.component.scss'],
})
export class LiveMockComponent implements OnDestroy {
  responseSubscription?: Subscription;

  saving = false;

  // Monaco editor options with TypeScript language for intellisense
  editorOptions = {
    theme: 'vs-dark',
    language: 'typescript',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true
  };

  liveMockForm = new FormGroup({
    enabled: new FormControl(false),
    code: new FormControl(LIVE_MOCK_TEMPLATE, [Validators.required]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      responseId: number;
      processor: ProcessorInterface | undefined;
    },
    public dialogRef: DialogRef,
    private responsesService: ResponsesService,
    private translateService: TranslateService
  ) {
    if (this.data.processor) {
      this.liveMockForm.patchValue({
        enabled: this.data.processor.enabled,
        code: this.data.processor.code,
      });
    }
  }

  ngOnDestroy() {
    this.responseSubscription?.unsubscribe();
  }

  /**
   * Configure Monaco editor with live mock type definitions for intellisense
   * @param editor - Monaco editor instance
   */
  onMonacoInit(editor: any) {
    if (monaco && monaco.languages && monaco.languages.typescript) {
      // Add extra TypeScript library with live mock type definitions
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        LIVE_MOCK_TYPE_DEFINITIONS,
        'live-mock-globals.d.ts'
      );
      
      // Configure TypeScript compiler options
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2015,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        typeRoots: ['node_modules/@types']
      });
    }
  }

  handleSave() {
    const responseId = this.data.responseId;
    if (this.liveMockForm.invalid && responseId) return;

    this.saving = true;

    const processor = {
      enabled: this.liveMockForm.value.enabled,
      code: this.liveMockForm.value.code,
    } as EditProcessorInterface;

    this.responsesService
      .editProcessor(responseId, processor)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          openToast(
            this.translateService.instant('PAGES.ROUTES.LIVE_MOCK_EDITED'),
            'success'
          );
          this.dialogRef.close();
        },
        error: (error) => {
          const errorMessage = error.error.errors[0];
          this.#changeToCreateUnexpectedly(errorMessage);
        },
      });
  }

  #changeToCreateUnexpectedly(error: string) {
    this.responseSubscription?.unsubscribe();

    openToast(error, 'error', 5000);
  }
}
