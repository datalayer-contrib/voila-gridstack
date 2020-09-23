import { DocumentWidget, Context } from '@jupyterlab/docregistry';
import { INotebookModel } from '@jupyterlab/notebook';
import { listIcon } from '@jupyterlab/ui-components';

import { NotebookActions, Notebook } from '@jupyterlab/notebook';
import { RenderMimeRegistry } from '@jupyterlab/rendermime';
import { CodeCell, ICodeCellModel } from '@jupyterlab/cells';
import { CodeMirrorMimeTypeService } from '@jupyterlab/codemirror';

import EditorPanel from './panel';

import Save from './toolbar/save';

export default class VoilaEditor extends DocumentWidget<
  EditorPanel,
  INotebookModel
> {
  private save: Save;

  constructor(context: Context<INotebookModel>, content: EditorPanel) {
    super({ context, content });
    this.id = 'voila-editor/editor:widget';
    this.title.label = 'Voila Editor';
    this.title.closable = true;
    this.title.icon = listIcon;

    // Adding the buttons in widget toolbar
    this.save = new Save(this.content);
    this.toolbar.addItem('save', this.save);

    this.context.ready.then(() => this.runCells());
  }

  dispose(): void {
    super.dispose();
    console.debug('Widget dispose');
  }

  runAll = () => {
    const nb = new Notebook({
      mimeTypeService: new CodeMirrorMimeTypeService(),
      rendermime: new RenderMimeRegistry()
    });

    NotebookActions.runAll(nb, this.context.sessionContext)
      .then(nb => {
        console.log(nb);
      })
      .catch(e => console.error(e));
  };

  runCells = () => {
    console.info('runCells');

    for (let i = 0; i < this.context.model.cells?.length; i++) {
      const cell = this.context.model.cells.get(i);

      if (cell.type === 'code') {
        const codeCell = new CodeCell({
          model: cell as ICodeCellModel,
          rendermime: new RenderMimeRegistry()
        });

        console.info('Cell:', cell);
        console.info('codeCell:', codeCell);

        CodeCell.execute(codeCell, this.context.sessionContext)
          .then(reply => {
            console.info('reply:', reply);
            if (!reply) {
              return true;
            }

            console.info(reply);
            if (reply.content.status === 'ok') {
              // const content = reply.content;
              // content.payload && content.payload.length
              return true;
            }
          })
          .catch(reason => console.error(reason.message));
      }
    }
  };
}
